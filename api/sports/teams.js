import { fetchFromApiSports } from '../_utils.js';

export default async function handler(req, res) {
  const search = req.query.search || "Fenerbahce";
  const country = req.query.country || "Turkey";
  const externalUrl = `https://v3.football.api-sports.io/teams?search=${encodeURIComponent(search)}&country=${encodeURIComponent(country)}`;
  const result = await fetchFromApiSports(
    "Search Teams",
    "/api/sports/teams",
    externalUrl
  );
  res.status(result.statusCode).json(result.json);
}
