import { fetchFromApiSports } from '../_utils.js';

export default async function handler(req, res) {
  const id = req.query.id;
  const teamId = req.query.teamId;
  const season = req.query.season || "2025";
  const leagueId = req.query.leagueId;

  let externalUrl = "https://v3.football.api-sports.io/fixtures";
  if (id) {
    externalUrl += `?id=${encodeURIComponent(id)}`;
  } else {
    externalUrl += `?season=${encodeURIComponent(season)}`;
    if (teamId) {
      externalUrl += `&team=${encodeURIComponent(teamId)}`;
    }
    if (leagueId) {
      externalUrl += `&league=${encodeURIComponent(leagueId)}`;
    }
  }

  const result = await fetchFromApiSports(
    "Fetch Fixtures",
    "/api/sports/fixtures",
    externalUrl
  );
  res.status(result.statusCode).json(result.json);
}
