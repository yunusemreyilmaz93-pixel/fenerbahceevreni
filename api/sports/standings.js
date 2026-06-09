import { fetchFromApiSports } from '../_utils.js';

export default async function handler(req, res) {
  const leagueId = req.query.leagueId || "203"; // default 203 (Süper Lig)
  const season = req.query.season || "2025";

  const externalUrl = `https://v3.football.api-sports.io/standings?league=${encodeURIComponent(leagueId)}&season=${encodeURIComponent(season)}`;
  const result = await fetchFromApiSports(
    "Fetch Standings",
    "/api/sports/standings",
    externalUrl
  );
  res.status(result.statusCode).json(result.json);
}
