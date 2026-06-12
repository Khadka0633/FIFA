import { GROUP_STAGE_MATCHES } from "../data/matches";
import { getDatabase, ref, update } from "firebase/database";

const IS_DEV = import.meta.env.DEV;
const API_KEY = "8dc688a211df452c854e5115232ea6a6";

const TEAM_NAME_TO_CODE = {
  // Group A
  Mexico: "MEX",
  "South Africa": "RSA",
  "Korea Republic": "KOR",
  "South Korea": "KOR",
  Czechia: "CZE",
  "Czech Republic": "CZE",

  // Group B
  Canada: "CAN",
  Qatar: "QAT",
  Switzerland: "SUI",
  "Bosnia and Herzegovina": "BIH",
  "Bosnia & Herzegovina": "BIH",
  "Bosnia-Herzegovina": "BIH",

  // Group C
  Brazil: "BRA",
  Morocco: "MAR",
  Haiti: "HAI",
  Scotland: "SCO",

  // Group D
  "United States": "USA",
  USA: "USA",
  Paraguay: "PAR",
  Australia: "AUS",
  Turkey: "TUR",
  Türkiye: "TUR",

  // Group E
  Germany: "GER",
  Curaçao: "CUW",
  Curacao: "CUW",
  "Côte d'Ivoire": "CIV",
  "Ivory Coast": "CIV",
  Ecuador: "ECU",

  // Group F
  Netherlands: "NED",
  Japan: "JPN",
  Tunisia: "TUN",
  Sweden: "SWE",

  // Group G
  Belgium: "BEL",
  Egypt: "EGY",
  "IR Iran": "IRN",
  Iran: "IRN",
  "New Zealand": "NZL",

  // Group H
  Spain: "ESP",
  "Cape Verde": "CPV",
  "Cape Verde Islands": "CPV",
  "Cabo Verde": "CPV",
  Uruguay: "URU",
  "Saudi Arabia": "KSA",

  // Group I
  France: "FRA",
  Senegal: "SEN",
  Norway: "NOR",
  Iraq: "IRQ",

  // Group J
  Argentina: "ARG",
  Algeria: "ALG",
  Austria: "AUT",
  Jordan: "JOR",

  // Group K
  Portugal: "POR",
  "DR Congo": "COD",
  "Congo DR": "COD",
  "Congo, DR": "COD",
  "Democratic Republic of Congo": "COD",
  Uzbekistan: "UZB",
  Colombia: "COL",

  // Group L
  England: "ENG",
  Croatia: "CRO",
  Ghana: "GHA",
  Panama: "PAN",
};

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

const fetchFromAPI = async (status) => {
  if (IS_DEV) {
    const url = `https://api.football-data.org/v4/competitions/WC/matches?status=${status}&_=${Date.now()}`;
    return fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`, {
      headers: { "X-Auth-Token": API_KEY },
    });
  } else {
    return fetch(`/api/wc-sync?status=${status}&_=${Date.now()}`);
  }
};

export const syncResults = async () => {
  console.log("🔄 syncResults called at", new Date().toLocaleTimeString());
  try {
    console.log("📡 Fetching from API...");
    const res = await fetchFromAPI("FINISHED");

    if (!res.ok) {
      console.error("❌ HTTP error:", res.status, res.statusText);
      return;
    }

    const data = await res.json();
    const matches = data.matches;
    console.log("✅ API response received, matches count:", matches?.length);

    if (!matches || matches.length === 0) {
      console.warn("⚠️ No finished matches returned");
      return;
    }

    const updates = {};

    for (const fixture of matches) {
      const homeCode = TEAM_NAME_TO_CODE[fixture.homeTeam.name];
      const awayCode = TEAM_NAME_TO_CODE[fixture.awayTeam.name];

      if (!homeCode || !awayCode) {
        console.warn(
          "⚠️ Unknown team name:",
          fixture.homeTeam.name,
          "vs",
          fixture.awayTeam.name,
        );
        continue;
      }

      const match = GROUP_STAGE_MATCHES.find(
        (m) => m.home === homeCode && m.away === awayCode,
      );

      if (!match) {
        console.warn(
          "⚠️ Match not found in schedule:",
          homeCode,
          "vs",
          awayCode,
        );
        continue;
      }

      const { home: homeScore, away: awayScore } = getScore(fixture);
      const winner =
        homeScore > awayScore
          ? homeCode
          : awayScore > homeScore
            ? awayCode
            : "DRAW";

      console.log(
        `⚽ ${homeCode} ${homeScore}-${awayScore} ${awayCode} → winner: ${winner}`,
      );
      updates[match.id] = { winner, homeScore, awayScore };
    }

    if (Object.keys(updates).length === 0) {
      console.log("ℹ️ No matches to update");
      return;
    }

    const db = getDatabase();
    await update(ref(db, "results"), updates);
    console.log(
      `🎉 Synced ${Object.keys(updates).length} results in one write!`,
    );
  } catch (e) {
    console.error("❌ Sync failed:", e);
  }
};

export const fetchLiveScores = async () => {
  try {
    const res = await fetchFromAPI("IN_PLAY");
    const data = await res.json();
    if (!data.matches) return {};

    const live = {};
    for (const fixture of data.matches) {
      const homeCode = TEAM_NAME_TO_CODE[fixture.homeTeam.name];
      const awayCode = TEAM_NAME_TO_CODE[fixture.awayTeam.name];
      if (!homeCode || !awayCode) continue;

      const match = GROUP_STAGE_MATCHES.find(
        (m) => m.home === homeCode && m.away === awayCode,
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
