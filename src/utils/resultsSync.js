import { setResult } from "./firebase";
import { GROUP_STAGE_MATCHES } from "../data/matches";

const API_KEY = "8dc688a211df452c854e5115232ea6a6";
const WC_COMPETITION_ID = 2000; // FIFA World Cup ID on football-data.org

const TEAM_NAME_TO_CODE = {
  "Mexico": "MEX", "South Africa": "RSA", "South Korea": "KOR", "Czechia": "CZE",
  "Canada": "CAN", "Qatar": "QAT", "Switzerland": "SUI", "Bosnia and Herzegovina": "BIH",
  "Brazil": "BRA", "Morocco": "MAR", "Haiti": "HAI", "Scotland": "SCO",
  "USA": "USA", "United States": "USA", "Paraguay": "PAR", "Australia": "AUS",
  "Turkey": "TUR", "Türkiye": "TUR", "Germany": "GER", "Curaçao": "CUW",
  "Côte d'Ivoire": "CIV", "Ecuador": "ECU", "Netherlands": "NED", "Japan": "JPN",
  "Tunisia": "TUN", "Ukraine": "UKR", "Belgium": "BEL", "Egypt": "EGY",
  "Iran": "IRN", "New Zealand": "NZL", "Spain": "ESP", "Cabo Verde": "CPV",
  "Uruguay": "URU", "Saudi Arabia": "KSA", "France": "FRA", "Senegal": "SEN",
  "Norway": "NOR", "Iraq": "IRQ", "Argentina": "ARG", "Algeria": "ALG",
  "Slovakia": "SVK", "Panama": "PAN", "Portugal": "POR", "DR Congo": "COD",
  "Uzbekistan": "UZB", "Colombia": "COL", "England": "ENG", "Croatia": "CRO",
  "Ghana": "GHA",
};

export const syncResults = async () => {
  try {
    const res = await fetch(
  `https://corsproxy.io/?${encodeURIComponent(`https://api.football-data.org/v4/competitions/${WC_COMPETITION_ID}/matches?status=FINISHED`)}`,
  { headers: { "X-Auth-Token": API_KEY } }
);
    const data = await res.json();
    const matches = data.matches;

    if (!matches || matches.length === 0) return;

    for (const fixture of matches) {
      const homeTeamName = fixture.homeTeam.name;
      const awayTeamName = fixture.awayTeam.name;
      const homeScore = fixture.score.fullTime.home;
      const awayScore = fixture.score.fullTime.away;

      const homeCode = TEAM_NAME_TO_CODE[homeTeamName];
      const awayCode = TEAM_NAME_TO_CODE[awayTeamName];

      if (!homeCode || !awayCode) continue;

      const match = GROUP_STAGE_MATCHES.find(
        (m) => m.home === homeCode && m.away === awayCode
      );

      if (!match) continue;

      const winner =
        homeScore > awayScore ? homeCode :
        awayScore > homeScore ? awayCode :
        "DRAW";

      await setResult(match.id, winner);
    }

    console.log("✅ Results synced from football-data.org!");
  } catch (e) {
    console.error("❌ Sync failed:", e);
  }
};