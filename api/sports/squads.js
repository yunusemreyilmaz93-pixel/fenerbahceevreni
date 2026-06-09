import { fetchFromApiSports } from '../_utils.js';

export default async function handler(req, res) {
  const teamId = req.query.teamId;
  if (!teamId) {
    return res.status(400).json({ 
      success: false, 
      message: "Takım ID parametresi (teamId) gereklidir." 
    });
  }
  const externalUrl = `https://v3.football.api-sports.io/players/squads?team=${encodeURIComponent(teamId)}`;
  const result = await fetchFromApiSports(
    "Fetch Team Squads",
    "/api/sports/squads",
    externalUrl
  );
  res.status(result.statusCode).json(result.json);
}
