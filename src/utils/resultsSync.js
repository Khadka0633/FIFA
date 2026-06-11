import { setResult } from "./firebase";
import { GROUP_STAGE_MATCHES } from "../data/matches";

const API_KEY = "8dc688a211df452c854e5115232ea6a6";

const TEAM_NAME_TO_CODE = {
  "Mexico": "MEX", "South Africa": "RSA", "South Korea": "KOR", "Czechia": "CZE", "Czech Republic": "CZE",
  "Canada": "CAN", "Qatar": "QAT", "Switzerland": "SUI", "Bosnia and Herzegovina": "BIH",
  "Brazil": "BRA", "Morocco": "MAR", "Haiti": "HAI", "Scotland": "SCO",
  "USA": "USA", "United States": "USA", "Paraguay": "PAR", "Australia": "AUS",
  "Turkey": "TUR", "Türkiye": "TUR",
  "Germany": "GER", "Curaçao": "CUW", "Curacao": "CUW",
  "Côte d'Ivoire": "CIV", "Ivory Coast": "CIV", "Ecuador": "ECU",
  "Netherlands": "NED", "Japan": "JPN", "Tunisia": "TUN", "Sweden": "SWE",
  "Belgium": "BEL", "Egypt": "EGY", "Iran": "IRN", "New Zealand": "NZL",
  "Spain": "ESP", "Cape Verde": "CPV", "Cabo Verde": "CPV", "Uruguay": "URU", "Saudi Arabia": "KSA",
  "France": "FRA", "Senegal": "SEN", "Norway": "NOR", "Iraq": "IRQ",
  "Argentina": "ARG", "Algeria": "ALG", "Austria": "AUT", "Jordan": "JOR",
  "Portugal": "POR", "DR Congo": "COD", "Congo DR": "COD", "Democratic Republic of Congo": "COD",
  "Uzbekistan": "UZB", "Colombia": "COL",
  "England": "ENG", "Croatia": "CRO", "Ghana": "GHA", "Panama": "PAN",
};

const getScore = (fixture) => {
  const ft = fixture.score?.fullTime;
  const ht = fixture.score?.halfTime;
  const reg = fixture.score?.regularTime;
  return {
    home: ft?.home ?? reg?.home ?? ht?.home ?? 0,
    away: ft?.away ?? reg?.away ?? ht?.away ?? 0,
  };
};

export const syncResults = async () => {
  try {
    const res = await fetch(
      `https://corsproxy.io/?${encodeURIComponent("https://api.football-data.org/v4/competitions/WC/matches?status=FINISHED")}`,
      { headers: { "X-Auth-Token": API_KEY } }
    );
    const data = await res.json();
    const matches = data.matches;

    if (!matches || matches.length === 0) return;

    for (const fixture of matches) {
      const homeCode = TEAM_NAME_TO_CODE[fixture.homeTeam.name];
      const awayCode = TEAM_NAME_TO_CODE[fixture.awayTeam.name];
      if (!homeCode || !awayCode) continue;

      const match = GROUP_STAGE_MATCHES.find(
        (m) => m.home === homeCode && m.away === awayCode
      );
      if (!match) continue;

      const { home: homeScore, away: awayScore } = getScore(fixture);

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

export const fetchLiveScores = async () => {
  try {
    const res = await fetch(
      `https://corsproxy.io/?${encodeURIComponent("https://api.football-data.org/v4/competitions/WC/matches?status=IN_PLAY")}`,
      { headers: { "X-Auth-Token": API_KEY } }
    );
    const data = await res.json();
    if (!data.matches) return {};

    const live = {};
    for (const fixture of data.matches) {
      const homeCode = TEAM_NAME_TO_CODE[fixture.homeTeam.name];
      const awayCode = TEAM_NAME_TO_CODE[fixture.awayTeam.name];
      if (!homeCode || !awayCode) continue;

      const match = GROUP_STAGE_MATCHES.find(
        (m) => m.home === homeCode && m.away === awayCode
      );
      if (!match) continue;

      const { home, away } = getScore(fixture);

      live[match.id] = {
        status: "LIVE",
        home,
        away,
        minute: fixture.minute ?? fixture.score?.duration ?? "?",
      };
    }
    return live;
  } catch (e) {
    console.error("❌ Live score fetch failed:", e);
    return {};
  }
};