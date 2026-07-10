/**
 * Public read API helpers — Faz A2
 * Express route handlers; Firestore Admin veya local public/data fallback.
 */
import type { Request, Response } from "express";
import fs from "fs";
import path from "path";

function localDataPath(...parts: string[]) {
  return path.join(process.cwd(), "public", "data", ...parts);
}

function readLocalJson<T>(file: string): T | null {
  try {
    const p = localDataPath(file);
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, "utf-8")) as T;
  } catch {
    return null;
  }
}

async function firestoreGetAll(
  adminDb: any,
  collectionName: string
): Promise<any[] | null> {
  if (!adminDb) return null;
  try {
    const snap = await adminDb.collection(collectionName).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e: any) {
    console.warn(`Firestore read ${collectionName}:`, e?.message);
    return null;
  }
}

async function firestoreGetDoc(
  adminDb: any,
  collectionName: string,
  id: string
): Promise<any | null> {
  if (!adminDb) return null;
  try {
    const doc = await adminDb.collection(collectionName).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  } catch (e: any) {
    console.warn(`Firestore get ${collectionName}/${id}:`, e?.message);
    return null;
  }
}

export function createPublicV1Router(getAdminDb: () => any) {
  const handlers = {
    async health(_req: Request, res: Response) {
      const db = getAdminDb();
      res.json({
        success: true,
        data: {
          service: "fenerbahce-evreni-api",
          version: "v1",
          firestore: !!db,
          time: new Date().toISOString(),
        },
      });
    },

    async standings(_req: Request, res: Response) {
      const db = getAdminDb();
      const fromFs = await firestoreGetAll(db, "standings");
      if (fromFs && fromFs.length > 0) {
        return res.json({
          success: true,
          data: fromFs.length === 1 ? fromFs[0] : fromFs,
          meta: { source: "firestore", count: fromFs.length },
        });
      }
      const local = readLocalJson<any>("standings.json");
      if (local) {
        return res.json({
          success: true,
          data: local,
          meta: { source: "local", fetchedAt: local.updatedAt },
        });
      }
      return res.status(404).json({
        success: false,
        message: "Puan durumu bulunamadı.",
        code: "STANDINGS_NOT_FOUND",
      });
    },

    async players(req: Request, res: Response) {
      const db = getAdminDb();
      const fromFs = await firestoreGetAll(db, "players");
      if (fromFs && fromFs.length > 0) {
        const status = (req.query.status as string) || "active";
        const filtered =
          status === "all"
            ? fromFs
            : fromFs.filter((p) => (p.status || "active") === status);
        return res.json({
          success: true,
          data: filtered,
          meta: { source: "firestore", count: filtered.length },
        });
      }
      const local = readLocalJson<{ players?: any[]; updatedAt?: string }>("squad.json");
      if (local?.players) {
        return res.json({
          success: true,
          data: local.players,
          meta: {
            source: "local",
            count: local.players.length,
            fetchedAt: local.updatedAt,
          },
        });
      }
      return res.status(404).json({
        success: false,
        message: "Oyuncu listesi bulunamadı.",
        code: "PLAYERS_NOT_FOUND",
      });
    },

    async playerBySlug(req: Request, res: Response) {
      const slug = req.params.slug;
      const db = getAdminDb();
      const fromFs = await firestoreGetAll(db, "players");
      if (fromFs && fromFs.length > 0) {
        const found = fromFs.find(
          (p) => p.slug === slug || p.id === slug
        );
        if (found) {
          return res.json({ success: true, data: found, meta: { source: "firestore" } });
        }
      }
      const local = readLocalJson<{ players?: any[] }>("squad.json");
      const p = local?.players?.find((x) => x.slug === slug || x.id === slug);
      if (p) {
        return res.json({ success: true, data: p, meta: { source: "local" } });
      }
      return res.status(404).json({
        success: false,
        message: `Oyuncu bulunamadı: ${slug}`,
        code: "PLAYER_NOT_FOUND",
      });
    },

    async matches(req: Request, res: Response) {
      const db = getAdminDb();
      const fromFs = await firestoreGetAll(db, "matches");
      if (fromFs && fromFs.length > 0) {
        return res.json({
          success: true,
          data: fromFs,
          meta: { source: "firestore", count: fromFs.length },
        });
      }
      const local = readLocalJson<any>("matches.json");
      if (local) {
        const list = Array.isArray(local) ? local : local.matches || [local];
        return res.json({
          success: true,
          data: list,
          meta: { source: "local", count: list.length },
        });
      }
      return res.status(404).json({
        success: false,
        message: "Maç listesi bulunamadı.",
        code: "MATCHES_NOT_FOUND",
      });
    },

    async matchAdvanced(req: Request, res: Response) {
      const id = req.params.id;
      const provider = (req.query.provider as string) || "fotmob";
      const db = getAdminDb();

      // Site match id → fotmob id via entity-map
      let resolvedIds = [id];
      try {
        const emPath = path.join(process.cwd(), "public", "data", "entity-map.json");
        if (fs.existsSync(emPath)) {
          const em = JSON.parse(fs.readFileSync(emPath, "utf-8"));
          for (const m of em.matchMappings || []) {
            if (m.siteMatchId === id && m.providerMatchId) {
              resolvedIds.push(
                `fotmob-${m.providerMatchId}`,
                m.advancedDocId,
                `${m.advancedDocId}`,
                `fotmob-${m.providerMatchId}__fotmob`
              );
            }
          }
        }
      } catch {
        /* ignore */
      }
      // also if id is bare fotmob numeric
      if (/^\d+$/.test(id)) {
        resolvedIds.push(`fotmob-${id}`, `fotmob-${id}__fotmob`);
      }

      if (db) {
        for (const rid of resolvedIds) {
          if (!rid) continue;
          const docId = rid.includes("__") ? rid : `${rid}__${provider}`;
          const doc = await firestoreGetDoc(db, "advancedMatchStats", docId);
          if (doc) {
            return res.json({
              success: true,
              data: doc,
              meta: { source: "firestore", provider, resolved: rid },
            });
          }
        }
      }

      // Local advanced files (worker output + public mirror for deploys)
      const advDirs = [
        path.join(process.cwd(), "data-worker", "output", "advanced"),
        path.join(process.cwd(), "public", "data", "advanced"),
      ];
      for (const advDir of advDirs) {
        for (const rid of resolvedIds) {
          if (!rid) continue;
          const candidates = [
            path.join(advDir, `${rid}.json`),
            path.join(advDir, `${rid}__${provider}.json`),
            path.join(
              advDir,
              rid.endsWith(`__${provider}`) ? `${rid}.json` : `${rid}__${provider}.json`
            ),
          ];
          for (const localPath of candidates) {
            if (fs.existsSync(localPath)) {
              const data = JSON.parse(fs.readFileSync(localPath, "utf-8"));
              return res.json({
                success: true,
                data,
                meta: { source: "local", file: path.basename(localPath) },
              });
            }
          }
        }
      }

      // Scan directories for providerMatchId
      try {
        for (const advDir of advDirs) {
          if (!fs.existsSync(advDir)) continue;
          for (const f of fs.readdirSync(advDir)) {
            if (!f.endsWith(".json")) continue;
            if (
              resolvedIds.some(
                (rid) => rid && f.includes(String(rid).replace(/__fotmob$/, ""))
              )
            ) {
              const data = JSON.parse(fs.readFileSync(path.join(advDir, f), "utf-8"));
              return res.json({
                success: true,
                data,
                meta: { source: "local-scan", file: f },
              });
            }
          }
        }
      } catch {
        /* ignore */
      }

      return res.status(404).json({
        success: false,
        message: "Gelişmiş maç istatistiği henüz yok.",
        code: "ADV_MATCH_NOT_FOUND",
      });
    },

    async articles(req: Request, res: Response) {
      const db = getAdminDb();
      const fromFs = await firestoreGetAll(db, "articles");
      if (fromFs) {
        const published = fromFs.filter(
          (a) => a.status === "published" || !a.status
        );
        return res.json({
          success: true,
          data: published,
          meta: { source: "firestore", count: published.length },
        });
      }
      return res.json({
        success: true,
        data: [],
        meta: { source: "none", count: 0 },
      });
    },
  };

  return handlers;
}
