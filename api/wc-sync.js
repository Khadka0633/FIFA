export default async function handler(req, res) {
  const API_KEY = "8dc688a211df452c854e5115232ea6a6";
  const { status } = req.query;

  const response = await fetch(
    `https://api.football-data.org/v4/competitions/WC/matches?status=${status}`,
    { headers: { "X-Auth-Token": API_KEY } },
  );

  const data = await response.json();

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.json(data);
}
