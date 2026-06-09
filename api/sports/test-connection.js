import { fetchFromApiSports } from '../_utils.js';

export default async function handler(req, res) {
  const result = await fetchFromApiSports(
    "Test Connection",
    "/api/sports/test-connection",
    "https://v3.football.api-sports.io/status"
  );
  res.status(result.statusCode).json(result.json);
}
