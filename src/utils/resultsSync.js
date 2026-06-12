import { setResult } from "./firebase";
import { GROUP_STAGE_MATCHES } from "../data/matches";

const API_KEY = "8dc688a211df452c854e5115232ea6a6";

const TEAM_NAME_TO_CODE = {
  // Group A
  "Mexico": "MEX",
  "South Africa": "RSA",
  "Korea Republic": "KOR",       // ✅ API uses this
  "South Korea": "KOR",
  "Czechia": "CZE",
  "Czech Republic": "CZE",

  // Group B
  "Canada": "CAN",
  "Qatar": "QAT",
  "Switzerland": "SUI",
  "Bosnia and Herzegovina": "BIH",
  "Bosnia & Herzegovina": "BIH",

  // Group C
  "Brazil": "BRA",
  "Morocco": "MAR",
  "Haiti": "HAI",
  "Scotland": "SCO",

  // Group D
  "United States": "USA",
  "USA": "USA",
  "Paraguay": "PAR",
  "Australia": "AUS",
  "Turkey": "TUR",
  "Türkiye": "TUR",

  // Group E
  "Germany": "GER",
  "Curaçao": "CUW",
  "Curacao": "CUW",
  "Côte d'Ivoire": "CIV",
  "Ivory Coast": "CIV",
  "Ecuador": "ECU",

  // Group F
  "Netherlands": "NED",
  "Japan": "JPN",
  "Tunisia": "TUN",
  "Sweden": "SWE",

  // Group G
  "Belgium": "BEL",
  "Egypt": "EGY",
  "IR Iran": "IRN",              // ✅ API uses this
  "Iran": "IRN",
  "New Zealand": "NZL",

  // Group H
  "Spain": "ESP",
  "Cape Verde": "CPV",
  "Cape Verde Islands": "CPV",   // ✅ API sometimes uses this
  "Cabo Verde": "CPV",
  "Uruguay": "URU",
  "Saudi Arabia": "KSA",

  // Group I
  "France": "FRA",
  "Senegal": "SEN",
  "Norway": "NOR",
  "Iraq": "IRQ",

  // Group J
  "Argentina": "ARG",
  "Algeria": "ALG",
  "Austria": "AUT",
  "Jordan": "JOR",

  // Group K
  "Portugal": "POR",
  "DR Congo": "COD",
  "Congo DR": "COD",
  "Congo, DR": "COD",            // ✅ API sometimes uses this
  "Democratic Republic of Congo": "COD",
  "Uzbekistan": "UZB",
  "Colombia": "COL",

  // Group L
  "England": "ENG",
  "Croatia": "CRO",
  "Ghana": "GHA",
  "Panama": "PAN",
};

// ✅ Fixed — handles null scores properly
const getScore = (fixture) => {
  const ft = fixture.score?.fullTime;
  const reg = fixture.score?.regularTime;
  const ht = fixture.score?.halfTime;
  const home = ft?.home ?? reg?.home ?? ht?.home;
  const away = ft?.away ?? reg?.away ?? ht?.away;
  return {
    home: typeof home === "number" ? home : 0,
    away: typeof away === "number" ? away : 0,
  };
};

// ✅ Only syncResults — fetchLiveScores removed
export const syncResults = async () => {
  try {
    const res = await fetch(
      `https://api.allorigins.win/raw?url=${encodeURIComponent("https://api.football-data.org/v4/competitions/WC/matches?status=FINISHED")}`,
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

      await setResult(match.id, winner, homeScore, awayScore);
    }

    console.log("✅ Results synced!");
  } catch (e) {
    console.error("❌ Sync failed:", e);
  }
};