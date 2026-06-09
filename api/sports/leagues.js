import { fetchFromApiSports } from '../_utils.js';

export default async function handler(req, res) {
  const country = req.query.country || "Turkey";
  const externalUrl = `https://v3.football.api-sports.io/leagues?country=${encodeURIComponent(country)}`;
  const result = await fetchFromApiSports(
    "Fetch Leagues",
    "/api/sports/leagues",
    externalUrl
  );
  res.status(result.statusCode).json(result.json);
}
