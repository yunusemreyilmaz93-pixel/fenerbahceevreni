import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import * as adminRaw from "firebase-admin";

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

const getAdminEmailAllowlist = (): string[] => {
  const fromEnv = (process.env.ADMIN_EMAILS || process.env.VITE_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  // Bilinen operatör (rules ile uyumlu); env boşsa en az bu
  if (!fromEnv.includes("yunusemreyilmaz93@gmail.com")) {
    fromEnv.push("yunusemreyilmaz93@gmail.com");
  }
  return fromEnv;
};

/**
 * Admin middleware:
 * 1) Gerçek Firebase ID token (Admin SDK hazırsa)
 * 2) Dev/mock: Bearer mock-admin-token-for-{email} — sadece allowlist + (dev veya ALLOW_MOCK_ADMIN=1)
 */
const checkAdmin = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Yetkisiz erişim. Kimlik doğrulama token'ı sağlanmadı.",
    });
  }

  const token = authHeader.slice("Bearer ".length).trim();
  const allowlist = getAdminEmailAllowlist();
  const allowMock =
    process.env.ALLOW_MOCK_ADMIN === "1" ||
    process.env.NODE_ENV !== "production";

  // Mock admin token (local / AI Studio)
  if (token.startsWith("mock-admin-token-for-")) {
    if (!allowMock) {
      return res.status(401).json({
        success: false,
        message: "Mock admin token production'da kapalı. ALLOW_MOCK_ADMIN veya gerçek Firebase token kullanın.",
      });
    }
    const email = token.replace("mock-admin-token-for-", "").trim().toLowerCase();
    if (!email || !allowlist.includes(email)) {
      return res.status(403).json({
        success: false,
        message: "Mock token e-postası admin listesinde değil.",
      });
    }
    (req as any).user = { email, uid: "mock-admin", mock: true };
    return next();
  }

  // Firebase Admin SDK
  if (adminInitError || !adminApp) {
    if (allowMock) {
      return res.status(503).json({
        success: false,
        message:
          "Firebase Admin yapılandırılmadı. Local mock için Authorization: Bearer mock-admin-token-for-{adminEmail}",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Sunucu taraflı yetkilendirme sistemi (Firebase Admin) yapılandırılamadı.",
    });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const email = (decodedToken.email || "").trim().toLowerCase();
    if (!email) {
      return res.status(403).json({
        success: false,
        message: "Erişim engellendi. Geçerli bir e-posta adresi bulunamadı.",
      });
    }
    if (!allowlist.includes(email)) {
      console.warn(`Admin yetkisi reddedildi: ${email}`);
      return res.status(403).json({
        success: false,
        message: "Erişim reddedildi. Bu işlemi yapmaya yetkiniz yok.",
      });
    }
    (req as any).user = decodedToken;
    next();
  } catch (error: any) {
    console.error("Firebase ID Token doğrulama hatası:", error.message);
    return res.status(401).json({
      success: false,
      message: "Oturum geçersiz veya süresi dolmuş.",
    });
  }
};

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
      return {
        statusCode: 502,
        json: {
          success: false,
          message: "API-Football yanıtı JSON formatında değil.",
          details: `API-Sports tarafından JSON dışı bir yanıt döndürüldü. Lütfen bağlantınızı ve API anahtarınızı kontrol edin.`,
          debug: {
            backendRoute,
            externalEndpoint: externalUrl,
            status: statusCode,
            contentType,
            errorPreview: rawText.substring(0, 300)
          }
        }
      };
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
      return {
        statusCode: 200, // Return 200 with success: false to gracefully show error in UI with status
        json: {
          success: false,
          isApiError: true,
          message: turkishError,
          data: rawData,
          debug: {
            backendRoute,
            externalEndpoint: externalUrl,
            status: statusCode,
            contentType
          },
          headers: rateLimits
        }
      };
    }

    return {
      statusCode: 200,
      json: {
        success: true,
        message: "API bağlantısı başarılı.",
        data: rawData,
        debug: {
          backendRoute,
          externalEndpoint: externalUrl,
          status: statusCode,
          contentType: "application/json"
        },
        headers: rateLimits
      }
    };

  } catch (error: any) {
    console.error(`Fetch exception for ${action} (${externalUrl}):`, error);
    return {
      statusCode: 500,
      json: {
        success: false,
        message: "API bağlantısı başarısız.",
        details: error?.message || "Bilinmeyen sunucu hatası",
        debug: {
          backendRoute,
          externalEndpoint: externalUrl,
          status: 500,
          contentType: "exception",
          errorPreview: error?.stack || error?.message
        }
      }
    };
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      success: true,
      message: "Backend çalışıyor."
    });
  });

  // ── Public API v1 (Faz A2) — local JSON fallback + Firestore Admin ──
  const { createPublicV1Router } = await import("./server/v1/publicApi");
  const getAdminDb = () => {
    try {
      if (!adminApp) return null;
      return admin.firestore();
    } catch {
      return null;
    }
  };
  const v1 = createPublicV1Router(getAdminDb);
  app.get("/api/v1/health", (req, res) => v1.health(req, res));
  app.get("/api/v1/standings", (req, res) => v1.standings(req, res));
  app.get("/api/v1/players", (req, res) => v1.players(req, res));
  app.get("/api/v1/players/:slug", (req, res) => v1.playerBySlug(req, res));
  app.get("/api/v1/matches", (req, res) => v1.matches(req, res));
  app.get("/api/v1/matches/:id/advanced", (req, res) => v1.matchAdvanced(req, res));
  app.get("/api/v1/articles", (req, res) => v1.articles(req, res));

  // ── Admin Jobs — checkAdmin zorunlu ──
  const jobsDir = path.join(process.cwd(), "data-worker", "output", "scrapeJobs");
  app.get("/api/admin/jobs", checkAdmin, async (req, res) => {
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

  app.post("/api/admin/jobs/run", checkAdmin, async (req, res) => {
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

  app.get("/api/v1/entity-map", async (req, res) => {
    try {
      const fs = await import("fs");
      const p = path.join(process.cwd(), "public", "data", "entity-map.json");
      if (!fs.existsSync(p)) {
        return res.status(404).json({ success: false, message: "entity-map yok; sync_entity_ids çalıştır" });
      }
      const data = JSON.parse(fs.readFileSync(p, "utf-8"));
      res.json({ success: true, data });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e?.message });
    }
  });

  // API Proxy - Test Connection
  app.get("/api/sports/test-connection", checkAdmin, async (req, res) => {
    const result = await fetchFromApiSports(
      "Test Connection",
      "/api/sports/test-connection",
      "https://v3.football.api-sports.io/status"
    );
    res.status(result.statusCode).json(result.json);
  });

  // API Proxy - Türkiye Ligleri (Leagues)
  app.get("/api/sports/leagues", checkAdmin, async (req, res) => {
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
  app.get("/api/sports/teams", checkAdmin, async (req, res) => {
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
  app.get("/api/sports/squad", checkAdmin, async (req, res) => {
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
  app.get("/api/sports/fixtures", checkAdmin, async (req, res) => {
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
  app.get("/api/sports/standings", checkAdmin, async (req, res) => {
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
