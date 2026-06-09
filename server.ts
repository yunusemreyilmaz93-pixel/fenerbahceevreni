import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Proxy - Test Connection
  app.get("/api/sports/test-connection", async (req, res) => {
    const apiKey = process.env.APISPORTS_KEY;
    if (!apiKey) {
      return res.status(400).json({ 
        success: false, 
        message: "API anahtarı bulunamadı. Lütfen APISPORTS_KEY secret ayarını kontrol edin." 
      });
    }

    try {
      const response = await fetch("https://v3.football.api-sports.io/status", {
        method: "GET",
        headers: {
          "x-apisports-key": apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawData = await response.json();
      
      // Get remaining/used rate limits from headers
      const remaining = response.headers.get("x-ratelimit-remaining") || "Bilinmiyor";
      const limit = response.headers.get("x-ratelimit-limit") || "Bilinmiyor";
      const requests = response.headers.get("x-ratelimit-requests") || "Bilinmiyor";

      res.json({
        success: true,
        data: rawData,
        headers: {
          remaining,
          limit,
          requests
        }
      });
    } catch (error: any) {
      console.error("Test Connection Error:", error);
      res.status(500).json({
        success: false,
        message: "API-Football verisi alınamadı. Lütfen API anahtarını, günlük limiti ve endpoint ayarlarını kontrol edin."
      });
    }
  });

  // API Proxy - Türkiye Ligleri (Leagues)
  app.get("/api/sports/leagues", async (req, res) => {
    const apiKey = process.env.APISPORTS_KEY;
    if (!apiKey) {
      return res.status(400).json({ 
        success: false, 
        message: "API anahtarı bulunamadı. Lütfen APISPORTS_KEY secret ayarını kontrol edin." 
      });
    }

    const country = req.query.country || "Turkey";
    try {
      const url = `https://v3.football.api-sports.io/leagues?country=${encodeURIComponent(country as string)}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "x-apisports-key": apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      res.json({ success: true, data });
    } catch (error: any) {
      console.error("Leagues Query Error:", error);
      res.status(500).json({
        success: false,
        message: "API-Football verisi alınamadı. Lütfen API anahtarını, günlük limiti ve endpoint ayarlarını kontrol edin."
      });
    }
  });

  // API Proxy - Team Search (Fenerbahçe vb.)
  app.get("/api/sports/teams", async (req, res) => {
    const apiKey = process.env.APISPORTS_KEY;
    if (!apiKey) {
      return res.status(400).json({ 
        success: false, 
        message: "API anahtarı bulunamadı. Lütfen APISPORTS_KEY secret ayarını kontrol edin." 
      });
    }

    const search = req.query.search || "Fenerbahce";
    const country = req.query.country || "Turkey";

    try {
      const url = `https://v3.football.api-sports.io/teams?search=${encodeURIComponent(search as string)}&country=${encodeURIComponent(country as string)}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "x-apisports-key": apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      res.json({ success: true, data });
    } catch (error: any) {
      console.error("Teams Query Error:", error);
      res.status(500).json({
        success: false,
        message: "API-Football verisi alınamadı. Lütfen API anahtarını, günlük limiti ve endpoint ayarlarını kontrol edin."
      });
    }
  });

  // API Proxy - Squad
  app.get("/api/sports/squad", async (req, res) => {
    const apiKey = process.env.APISPORTS_KEY;
    if (!apiKey) {
      return res.status(400).json({ 
        success: false, 
        message: "API anahtarı bulunamadı. Lütfen APISPORTS_KEY secret ayarını kontrol edin." 
      });
    }

    const teamId = req.query.teamId;
    if (!teamId) {
      return res.status(400).json({ success: false, message: "Takım ID parametresi (teamId) gereklidir." });
    }

    try {
      const url = `https://v3.football.api-sports.io/players/squads?team=${encodeURIComponent(teamId as string)}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "x-apisports-key": apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      res.json({ success: true, data });
    } catch (error: any) {
      console.error("Squad Query Error:", error);
      res.status(500).json({
        success: false,
        message: "API-Football verisi alınamadı. Lütfen API anahtarını, günlük limiti ve endpoint ayarlarını kontrol edin."
      });
    }
  });

  // API Proxy - Fixtures
  app.get("/api/sports/fixtures", async (req, res) => {
    const apiKey = process.env.APISPORTS_KEY;
    if (!apiKey) {
      return res.status(400).json({ 
        success: false, 
        message: "API anahtarı bulunamadı. Lütfen APISPORTS_KEY secret ayarını kontrol edin." 
      });
    }

    const teamId = req.query.teamId;
    const season = req.query.season || "2025";
    const leagueId = req.query.leagueId;

    try {
      let url = `https://v3.football.api-sports.io/fixtures?season=${encodeURIComponent(season as string)}`;
      if (teamId) {
        url += `&team=${encodeURIComponent(teamId as string)}`;
      }
      if (leagueId) {
        url += `&league=${encodeURIComponent(leagueId as string)}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "x-apisports-key": apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      res.json({ success: true, data });
    } catch (error: any) {
      console.error("Fixtures Query Error:", error);
      res.status(500).json({
        success: false,
        message: "API-Football verisi alınamadı. Lütfen API anahtarını, günlük limiti ve endpoint ayarlarını kontrol edin."
      });
    }
  });

  // API Proxy - Standings
  app.get("/api/sports/standings", async (req, res) => {
    const apiKey = process.env.APISPORTS_KEY;
    if (!apiKey) {
      return res.status(400).json({ 
        success: false, 
        message: "API anahtarı bulunamadı. Lütfen APISPORTS_KEY secret ayarını kontrol edin." 
      });
    }

    const leagueId = req.query.leagueId || "203"; // default 203 (Süper Lig)
    const season = req.query.season || "2025";

    try {
      const url = `https://v3.football.api-sports.io/standings?league=${encodeURIComponent(leagueId as string)}&season=${encodeURIComponent(season as string)}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "x-apisports-key": apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      res.json({ success: true, data });
    } catch (error: any) {
      console.error("Standings Query Error:", error);
      res.status(500).json({
        success: false,
        message: "API-Football verisi alınamadı. Lütfen API anahtarını, günlük limiti ve endpoint ayarlarını kontrol edin."
      });
    }
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
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
