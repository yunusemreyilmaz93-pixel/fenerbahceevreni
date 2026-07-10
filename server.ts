import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import * as adminRaw from "firebase-admin";
import {
  applySecurityMiddleware,
  adminApiLimiter,
  createRequireAdmin,
  createRequireAuth,
  isProd,
  publicErrorBody,
  publicWriteLimiter,
  voteLimiter,
} from "./server/security";

const admin = adminRaw as any;

dotenv.config();

let adminApp: any = null;
let adminInitError: string | null = null;

try {
  adminApp = admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
} catch (error: any) {
  adminInitError = error.message;
  console.warn("Firebase Admin standard initialization failed (safe mode active):", error.message);
}

const getAdminAuth = () => {
  if (adminInitError || !adminApp) return null;
  try {
    return admin.auth();
  } catch {
    return null;
  }
};

/** Admin middleware: real Firebase ID token + admin claim or email allowlist. Mock tokens never accepted. */
const checkAdmin = createRequireAdmin(getAdminAuth);
const requireAuth = createRequireAuth(getAdminAuth);

// Helper to make API-Sports call and handle non-JSON responses gracefully
async function fetchFromApiSports(
  action: string,
  backendRoute: string,
  externalUrl: string
) {
  const apiKey = process.env.APISPORTS_KEY;
  if (!apiKey) {
    return {
      statusCode: 400,
      json: {
        success: false,
        message: "API anahtarı bulunamadı. Lütfen APISPORTS_KEY secret ayarını kontrol edin.",
        debug: {
          backendRoute,
          externalEndpoint: externalUrl,
          status: 400,
          contentType: "application/json"
        }
      }
    };
  }

  try {
    const response = await fetch(externalUrl, {
      method: "GET",
      headers: {
        "x-apisports-key": apiKey
      }
    });

    const statusCode = response.status;
    const contentType = response.headers.get("content-type") || "";
    
    // Retrieve rate-limiting custom headers from API-Sports
    const remaining = response.headers.get("x-ratelimit-remaining") || "Bilinmiyor";
    const limit = response.headers.get("x-ratelimit-limit") || "Bilinmiyor";
    const requests = response.headers.get("x-ratelimit-requests") || "Bilinmiyor";

    const rateLimits = { remaining, limit, requests };

    if (!contentType.includes("application/json")) {
      const rawText = await response.text();
      console.error(`API response is not JSON. Action: ${action}, Status: ${statusCode}, Content-Type: ${contentType}. Raw response preview:`, rawText.substring(0, 200));
      const json: Record<string, unknown> = {
        success: false,
        message: "API-Football yanıtı JSON formatında değil.",
        details: "API-Sports tarafından JSON dışı bir yanıt döndürüldü.",
      };
      if (!isProd()) {
        json.debug = {
          backendRoute,
          externalEndpoint: externalUrl,
          status: statusCode,
          contentType,
          errorPreview: rawText.substring(0, 300),
        };
      }
      return { statusCode: 502, json };
    }

    const rawData = await response.json();

    // Check if API-Sports returned an error object inside its JSON response
    // Sometimes API-Sports returns 200 OK but has: {"errors": {"token": "Error message"} or similar}
    let success = true;
    let turkishError = null;
    
    if (rawData.errors && Object.keys(rawData.errors).length > 0) {
      const firstErrorKey = Object.keys(rawData.errors)[0];
      const errorVal = rawData.errors[firstErrorKey];
      console.error(`API-Sports returned internal error for ${action}:`, rawData.errors);
      
      success = false;
      if (firstErrorKey === "token" || errorVal?.includes("token") || errorVal?.includes("key") || errorVal?.toLowerCase().includes("api key") || errorVal?.toLowerCase().includes("invalid")) {
        turkishError = "API anahtarı bulunamadı. APISPORTS_KEY secret ayarını kontrol edin.";
      } else if (errorVal?.includes("limit") || errorVal?.includes("request count") || errorVal?.toLowerCase().includes("exceeded")) {
        turkishError = "Günlük request limiti dolmuş olabilir.";
      } else {
        turkishError = `API-Football verisi alınamadı. Hata: ${errorVal || 'Bilinmiyor'}`;
      }
    }

    if (!success) {
      const json: Record<string, unknown> = {
        success: false,
        isApiError: true,
        message: turkishError,
        data: rawData,
        headers: rateLimits,
      };
      if (!isProd()) {
        json.debug = {
          backendRoute,
          externalEndpoint: externalUrl,
          status: statusCode,
          contentType,
        };
      }
      return { statusCode: 200, json };
    }

    const okJson: Record<string, unknown> = {
      success: true,
      message: "API bağlantısı başarılı.",
      data: rawData,
      headers: rateLimits,
    };
    if (!isProd()) {
      okJson.debug = {
        backendRoute,
        externalEndpoint: externalUrl,
        status: statusCode,
        contentType: "application/json",
      };
    }
    return { statusCode: 200, json: okJson };

  } catch (error: any) {
    console.error(`Fetch exception for ${action} (${externalUrl}):`, error);
    return {
      statusCode: 500,
      json: publicErrorBody("API bağlantısı başarısız.", {
        details: error?.message || "Bilinmeyen sunucu hatası",
        debug: {
          backendRoute,
          externalEndpoint: externalUrl,
          status: 500,
          contentType: "exception",
          errorPreview: error?.stack || error?.message,
        },
      }),
    };
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  applySecurityMiddleware(app);
  // Reject oversized bodies (DoS / payload abuse)
  app.use(express.json({ limit: "100kb" }));

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      success: true,
      message: "Backend çalışıyor."
    });
  });

  // ── Public API v1 (Faz A2) — local JSON fallback + Firestore Admin ──
  const { createPublicV1Router } = await import("./server/v1/publicApi");
  const { createSecurePublicHandlers } = await import("./server/v1/securePublic");
  const getAdminDb = () => {
    try {
      if (!adminApp) return null;
      return admin.firestore();
    } catch {
      return null;
    }
  };
  const v1 = createPublicV1Router(getAdminDb);
  const secure = createSecurePublicHandlers(getAdminDb);
  app.get("/api/v1/health", (req, res) => v1.health(req, res));
  app.get("/api/v1/standings", (req, res) => v1.standings(req, res));
  app.get("/api/v1/players", (req, res) => v1.players(req, res));
  app.get("/api/v1/players/:slug", (req, res) => v1.playerBySlug(req, res));
  app.get("/api/v1/matches", (req, res) => v1.matches(req, res));
  app.get("/api/v1/matches/:id/advanced", (req, res) => v1.matchAdvanced(req, res));
  app.get("/api/v1/articles", (req, res) => v1.articles(req, res));

  // ── Secure public writes (rate-limited; Admin SDK aggregates) ──
  app.post(
    "/api/v1/polls/:pollId/vote",
    voteLimiter,
    requireAuth,
    (req, res) => secure.vote(req, res)
  );
  app.post(
    "/api/v1/public/contact",
    publicWriteLimiter,
    (req, res) => secure.contact(req, res)
  );
  app.post(
    "/api/v1/public/newsletter",
    publicWriteLimiter,
    (req, res) => secure.newsletter(req, res)
  );
  app.post(
    "/api/v1/public/waitlist",
    publicWriteLimiter,
    (req, res) => secure.waitlist(req, res)
  );

  // ── Admin Jobs — checkAdmin + rate limit ──
  const jobsDir = path.join(process.cwd(), "data-worker", "output", "scrapeJobs");
  app.get("/api/admin/jobs", adminApiLimiter, checkAdmin, async (req, res) => {
    try {
      const fs = await import("fs");
      if (!fs.existsSync(jobsDir)) {
        return res.json({ success: true, data: [] });
      }
      const files = fs
        .readdirSync(jobsDir)
        .filter((f) => f.endsWith(".json"))
        .sort()
        .reverse();
      const data = files.slice(0, 40).map((f) => {
        try {
          const raw = JSON.parse(fs.readFileSync(path.join(jobsDir, f), "utf-8"));
          return { id: f.replace(/\.json$/, ""), ...raw };
        } catch {
          return { id: f, status: "unknown" };
        }
      });
      res.json({ success: true, data });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e?.message || "Job listesi okunamadı" });
    }
  });

  app.post("/api/admin/jobs/run", adminApiLimiter, checkAdmin, async (req, res) => {
    const type = req.body?.type as string;
    const season = (req.body?.season as string) || "2025-26";
    const allowed = [
      "health_probe",
      "sync_standings",
      "sync_squad",
      "sync_match_advanced",
      "sync_player_season_stats",
      "sync_entity_ids",
      "sync_fixtures",
    ];
    if (!type || !allowed.includes(type)) {
      return res.status(400).json({ success: false, message: "Geçersiz job type" });
    }
    try {
      const { spawn } = await import("child_process");
      const script = path.join(process.cwd(), "data-worker", "run_job.py");
      const args = [script, "--type", type, "--season", String(season), "--trigger", "admin"];
      const child = spawn("python", args, {
        cwd: process.cwd(),
        env: process.env,
        windowsHide: true,
      });
      let stdout = "";
      let stderr = "";
      child.stdout?.on("data", (d) => {
        stdout += d.toString();
      });
      child.stderr?.on("data", (d) => {
        stderr += d.toString();
      });
      const exitCode: number = await new Promise((resolve) => {
        child.on("close", (code) => resolve(code ?? 1));
        setTimeout(() => {
          try {
            child.kill();
          } catch {
            /* ignore */
          }
          resolve(124);
        }, 560000);
      });
      res.json({
        success: exitCode === 0,
        data: {
          type,
          season,
          status: exitCode === 0 ? "success" : "failed",
          exitCode,
          stdout: stdout.slice(-4000),
          stderr: stderr.slice(-2000),
        },
        message: exitCode === 0 ? "Job tamamlandı" : "Job hata ile bitti",
      });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e?.message || "Job spawn failed" });
    }
  });

  // Entity map contains provider IDs — admin only
  app.get("/api/v1/entity-map", adminApiLimiter, checkAdmin, async (req, res) => {
    try {
      const fs = await import("fs");
      const p = path.join(process.cwd(), "public", "data", "entity-map.json");
      if (!fs.existsSync(p)) {
        return res.status(404).json({ success: false, message: "entity-map yok; sync_entity_ids çalıştır" });
      }
      const data = JSON.parse(fs.readFileSync(p, "utf-8"));
      res.json({ success: true, data });
    } catch (e: any) {
      res.status(500).json(publicErrorBody("entity-map okunamadı."));
    }
  });

  // API Proxy - Test Connection
  app.get("/api/sports/test-connection", adminApiLimiter, checkAdmin, async (req, res) => {
    const result = await fetchFromApiSports(
      "Test Connection",
      "/api/sports/test-connection",
      "https://v3.football.api-sports.io/status"
    );
    res.status(result.statusCode).json(result.json);
  });

  // API Proxy - Türkiye Ligleri (Leagues)
  app.get("/api/sports/leagues", adminApiLimiter, checkAdmin, async (req, res) => {
    const country = req.query.country || "Turkey";
    const externalUrl = `https://v3.football.api-sports.io/leagues?country=${encodeURIComponent(country as string)}`;
    const result = await fetchFromApiSports(
      "Fetch Leagues",
      "/api/sports/leagues",
      externalUrl
    );
    res.status(result.statusCode).json(result.json);
  });

  // API Proxy - Team Search (Fenerbahçe vb.)
  app.get("/api/sports/teams", adminApiLimiter, checkAdmin, async (req, res) => {
    const search = req.query.search || "Fenerbahce";
    const country = req.query.country || "Turkey";
    const externalUrl = `https://v3.football.api-sports.io/teams?search=${encodeURIComponent(search as string)}&country=${encodeURIComponent(country as string)}`;
    const result = await fetchFromApiSports(
      "Search Teams",
      "/api/sports/teams",
      externalUrl
    );
    res.status(result.statusCode).json(result.json);
  });

  // API Proxy - Squad
  app.get("/api/sports/squad", adminApiLimiter, checkAdmin, async (req, res) => {
    const teamId = req.query.teamId;
    if (!teamId) {
      return res.status(400).json({ 
        success: false, 
        message: "Takım ID parametresi (teamId) gereklidir." 
      });
    }
    const externalUrl = `https://v3.football.api-sports.io/players/squads?team=${encodeURIComponent(teamId as string)}`;
    const result = await fetchFromApiSports(
      "Fetch Team Squad",
      "/api/sports/squad",
      externalUrl
    );
    res.status(result.statusCode).json(result.json);
  });

  // API Proxy - Fixtures
  app.get("/api/sports/fixtures", adminApiLimiter, checkAdmin, async (req, res) => {
    const teamId = req.query.teamId;
    const season = req.query.season || "2025";
    const leagueId = req.query.leagueId;

    let externalUrl = `https://v3.football.api-sports.io/fixtures?season=${encodeURIComponent(season as string)}`;
    if (teamId) {
      externalUrl += `&team=${encodeURIComponent(teamId as string)}`;
    }
    if (leagueId) {
      externalUrl += `&league=${encodeURIComponent(leagueId as string)}`;
    }

    const result = await fetchFromApiSports(
      "Fetch Fixtures",
      "/api/sports/fixtures",
      externalUrl
    );
    res.status(result.statusCode).json(result.json);
  });

  // API Proxy - Standings
  app.get("/api/sports/standings", adminApiLimiter, checkAdmin, async (req, res) => {
    const leagueId = req.query.leagueId || "203"; // default 203 (Süper Lig)
    const season = req.query.season || "2025";

    const externalUrl = `https://v3.football.api-sports.io/standings?league=${encodeURIComponent(leagueId as string)}&season=${encodeURIComponent(season as string)}`;
    const result = await fetchFromApiSports(
      "Fetch Standings",
      "/api/sports/standings",
      externalUrl
    );
    res.status(result.statusCode).json(result.json);
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

