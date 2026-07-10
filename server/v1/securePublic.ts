/**
 * Rate-limited public write endpoints backed by Firebase Admin SDK.
 * Votes, contact, newsletter, premium waitlist — never trust client aggregates.
 */
import type { Request, Response } from "express";
import {
  honeypotTriggered,
  publicErrorBody,
  sanitizeEmail,
  sanitizeStr,
} from "../security";

function getDb(getAdminDb: () => any) {
  return getAdminDb();
}

export function createSecurePublicHandlers(getAdminDb: () => any) {
  return {
    /** POST /api/v1/polls/:pollId/vote  Body: { optionId }  Auth: Bearer */
    async vote(req: Request, res: Response) {
      const db = getDb(getAdminDb);
      if (!db) {
        return res
          .status(503)
          .json(publicErrorBody("Veritabanı geçici olarak kullanılamıyor."));
      }

      const user = (req as any).user;
      const uid = user?.uid as string | undefined;
      if (!uid) {
        return res.status(401).json(publicErrorBody("Oturum gerekli."));
      }

      const pollId = sanitizeStr(req.params.pollId, 120);
      const optionId = sanitizeStr(req.body?.optionId, 200);
      if (!pollId || !optionId) {
        return res
          .status(400)
          .json(publicErrorBody("pollId ve optionId zorunludur."));
      }

      try {
        const pollRef = db.collection("polls").doc(pollId);
        const voteRef = pollRef.collection("votes").doc(uid);

        const result = await db.runTransaction(async (tx: any) => {
          const pollSnap = await tx.get(pollRef);
          if (!pollSnap.exists) {
            throw Object.assign(new Error("Anket bulunamadı."), { code: 404 });
          }
          const poll = pollSnap.data() || {};
          if (poll.status !== "active") {
            throw Object.assign(new Error("Bu anket artık aktif değil."), {
              code: 400,
            });
          }

          const options: string[] = Array.isArray(poll.options)
            ? poll.options
            : [];
          // Support string[] options or {id,label}[]
          const optionValues = options.map((o: any) =>
            typeof o === "string" ? o : o?.id || o?.label || String(o)
          );
          if (!optionValues.includes(optionId)) {
            throw Object.assign(new Error("Geçersiz anket seçeneği."), {
              code: 400,
            });
          }

          const voteSnap = await tx.get(voteRef);
          if (voteSnap.exists) {
            throw Object.assign(
              new Error("Bu ankette daha önce oy kullandınız."),
              { code: 409 }
            );
          }

          const createdAt = new Date().toISOString();
          tx.set(voteRef, {
            optionId,
            userId: uid,
            createdAt,
          });

          // Maintain aggregates server-side (client cannot write poll parent)
          let votes = poll.votes;
          if (Array.isArray(votes)) {
            const next = [...votes];
            const idx = optionValues.indexOf(optionId);
            while (next.length < optionValues.length) next.push(0);
            if (idx >= 0) next[idx] = (Number(next[idx]) || 0) + 1;
            votes = next;
          } else if (votes && typeof votes === "object") {
            votes = {
              ...votes,
              [optionId]: (Number(votes[optionId]) || 0) + 1,
            };
          } else {
            // default object map
            const map: Record<string, number> = {};
            optionValues.forEach((o) => {
              map[o] = o === optionId ? 1 : 0;
            });
            votes = map;
          }

          const totalVotes = Array.isArray(votes)
            ? votes.reduce((s: number, v: any) => s + (Number(v) || 0), 0)
            : Object.values(votes as Record<string, number>).reduce(
                (s, v) => s + (Number(v) || 0),
                0
              );

          tx.update(pollRef, {
            votes,
            totalVotes,
            updatedAt: createdAt,
          });

          return { optionId, totalVotes, votes };
        });

        return res.json({ success: true, data: result });
      } catch (e: any) {
        const code = e?.code === 404 || e?.code === 400 || e?.code === 409
          ? e.code
          : 500;
        const status =
          code === 404 ? 404 : code === 409 ? 409 : code === 400 ? 400 : 500;
        return res
          .status(status)
          .json(
            publicErrorBody(
              e?.message || "Oy kaydedilemedi.",
              status === 500 ? { details: String(e?.message || e) } : undefined
            )
          );
      }
    },

    /** POST /api/v1/public/contact */
    async contact(req: Request, res: Response) {
      if (honeypotTriggered(req.body)) {
        // Silent success for bots
        return res.json({ success: true, message: "Mesaj alındı." });
      }

      const db = getDb(getAdminDb);
      if (!db) {
        return res
          .status(503)
          .json(publicErrorBody("Servis geçici olarak kullanılamıyor."));
      }

      const name = sanitizeStr(req.body?.name, 120);
      const email = sanitizeEmail(req.body?.email);
      const subject = sanitizeStr(req.body?.subject, 200);
      const message = sanitizeStr(req.body?.message, 5000);
      const messageType = sanitizeStr(req.body?.messageType || "genel", 40, false) || "genel";

      if (!name || !email || !subject || !message) {
        return res
          .status(400)
          .json(publicErrorBody("Zorunlu alanlar eksik veya geçersiz."));
      }

      const now = new Date().toISOString();
      const doc: Record<string, unknown> = {
        name,
        email,
        subject,
        message,
        messageType,
        status: "new",
        createdAt: now,
        updatedAt: now,
        source: "api",
      };

      if (messageType === "sponsor-reklam") {
        const companyName = sanitizeStr(req.body?.companyName || "", 160, false);
        const websiteUrl = sanitizeStr(req.body?.websiteUrl || "", 300, false);
        const budgetRange = sanitizeStr(req.body?.budgetRange || "", 80, false);
        if (companyName) doc.companyName = companyName;
        if (websiteUrl) doc.websiteUrl = websiteUrl;
        if (budgetRange) doc.budgetRange = budgetRange;
      }

      try {
        await db.collection("contactMessages").add(doc);
        return res.json({ success: true, message: "Mesaj alındı." });
      } catch (e: any) {
        return res
          .status(500)
          .json(publicErrorBody("Mesaj kaydedilemedi.", { details: e?.message }));
      }
    },

    /** POST /api/v1/public/newsletter */
    async newsletter(req: Request, res: Response) {
      if (honeypotTriggered(req.body)) {
        return res.json({
          success: true,
          message: "Bültene katıldın. İlk sayıda görüşürüz.",
        });
      }

      const db = getDb(getAdminDb);
      if (!db) {
        return res
          .status(503)
          .json(publicErrorBody("Servis geçici olarak kullanılamıyor."));
      }

      const email = sanitizeEmail(req.body?.email);
      const name = sanitizeStr(req.body?.name || "", 120, false) || "";
      const source = sanitizeStr(req.body?.source || "newsletter-page", 80, false) || "newsletter-page";
      let interests: string[] = [];
      if (Array.isArray(req.body?.interests)) {
        interests = req.body.interests
          .filter((x: unknown) => typeof x === "string")
          .map((x: string) => x.trim().slice(0, 60))
          .filter(Boolean)
          .slice(0, 20);
      }

      if (!email) {
        return res.status(400).json(publicErrorBody("Geçersiz e-posta adresi."));
      }

      try {
        const col = db.collection("newsletterSubscribers");
        const snap = await col.where("email", "==", email).limit(5).get();
        const now = new Date().toISOString();

        const active = snap.docs.find((d: any) => d.data()?.status === "active");
        if (active) {
          return res.status(409).json({
            success: false,
            message: "Bu e-posta zaten bültene kayıtlı.",
            isDuplicate: true,
          });
        }

        const unsub = snap.docs.find(
          (d: any) => d.data()?.status === "unsubscribed"
        );
        if (unsub) {
          await unsub.ref.update({
            name: name || unsub.data()?.name || "",
            status: "active",
            source,
            interests,
            subscribedAt: now,
            unsubscribedAt: null,
            updatedAt: now,
          });
          return res.json({
            success: true,
            message: "Bültene katıldın. İlk sayıda görüşürüz.",
          });
        }

        await col.add({
          email,
          name,
          source,
          interests,
          status: "active",
          subscribedAt: now,
          unsubscribedAt: null,
          createdAt: now,
          updatedAt: now,
        });

        return res.json({
          success: true,
          message: "Bültene katıldın. İlk sayıda görüşürüz.",
        });
      } catch (e: any) {
        return res
          .status(500)
          .json(publicErrorBody("Kayıt tamamlanamadı.", { details: e?.message }));
      }
    },

    /** POST /api/v1/public/waitlist */
    async waitlist(req: Request, res: Response) {
      if (honeypotTriggered(req.body)) {
        return res.json({ success: true, message: "Listeye eklendiniz." });
      }

      const db = getDb(getAdminDb);
      if (!db) {
        return res
          .status(503)
          .json(publicErrorBody("Servis geçici olarak kullanılamıyor."));
      }

      const email = sanitizeEmail(req.body?.email);
      const name = sanitizeStr(req.body?.name, 120);
      const planInterest =
        sanitizeStr(req.body?.planInterest || req.body?.interest || "Hepsi", 80) ||
        "Hepsi";

      if (!email || !name) {
        return res
          .status(400)
          .json(publicErrorBody("Ad ve geçerli e-posta zorunludur."));
      }

      const now = new Date().toISOString();
      try {
        await db.collection("premiumWaitlist").add({
          email,
          name,
          planInterest,
          status: "waiting",
          createdAt: now,
          source: sanitizeStr(req.body?.source || "premium-page", 80, false) || "premium-page",
        });
        return res.json({ success: true, message: "Listeye eklendiniz." });
      } catch (e: any) {
        return res
          .status(500)
          .json(publicErrorBody("Kayıt tamamlanamadı.", { details: e?.message }));
      }
    },
  };
}
