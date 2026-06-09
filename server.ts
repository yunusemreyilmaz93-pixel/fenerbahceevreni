import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

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

  // API Proxy - Test Connection
  app.get("/api/sports/test-connection", async (req, res) => {
    const result = await fetchFromApiSports(
      "Test Connection",
      "/api/sports/test-connection",
      "https://v3.football.api-sports.io/status"
    );
    res.status(result.statusCode).json(result.json);
  });

  // API Proxy - Türkiye Ligleri (Leagues)
  app.get("/api/sports/leagues", async (req, res) => {
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
  app.get("/api/sports/teams", async (req, res) => {
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
  app.get("/api/sports/squad", async (req, res) => {
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
  app.get("/api/sports/fixtures", async (req, res) => {
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
  app.get("/api/sports/standings", async (req, res) => {
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
