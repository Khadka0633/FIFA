import { GROUP_STAGE_MATCHES } from "../data/matches";
import { KNOCKOUT_MATCHES } from "../data/knockoutMatches";
import { getDatabase, ref, update, get } from "firebase/database";

const IS_DEV = import.meta.env.DEV;
const API_KEY = "8dc688a211df452c854e5115232ea6a6";

const TEAM_NAME_TO_CODE = {
  // Group A
  Mexico: "MEX", "South Africa": "RSA", "Korea Republic": "KOR",
  "South Korea": "KOR", Czechia: "CZE", "Czech Republic": "CZE",
  // Group B
  Canada: "CAN", Qatar: "QAT", Switzerland: "SUI",
  "Bosnia and Herzegovina": "BIH", "Bosnia & Herzegovina": "BIH",
  // Group C
  Brazil: "BRA", Morocco: "MAR", Haiti: "HAI", Scotland: "SCO",
  // Group D
  "United States": "USA", USA: "USA", Paraguay: "PAR",
  Australia: "AUS", Turkey: "TUR", Türkiye: "TUR",
  // Group E
  Germany: "GER", Curaçao: "CUW", Curacao: "CUW",
  "Côte d'Ivoire": "CIV", "Ivory Coast": "CIV", Ecuador: "ECU",
  // Group F
  Netherlands: "NED", Japan: "JPN", Tunisia: "TUN", Sweden: "SWE",
  // Group G
  Belgium: "BEL", Egypt: "EGY", "IR Iran": "IRN", Iran: "IRN",
  "New Zealand": "NZL",
  // Group H
  Spain: "ESP", "Cape Verde": "CPV", "Cabo Verde": "CPV",
  Uruguay: "URU", "Saudi Arabia": "KSA",
  // Group I
  France: "FRA", Senegal: "SEN", Norway: "NOR", Iraq: "IRQ",
  // Group J
  Argentina: "ARG", Algeria: "ALG", Austria: "AUT", Jordan: "JOR",
  // Group K
  Portugal: "POR", "DR Congo": "COD", "Congo DR": "COD",
  Uzbekistan: "UZB", Colombia: "COL",
  // Group L
  England: "ENG", Croatia: "CRO", Ghana: "GHA", Panama: "PAN",
  // Safety mappings
  "Republic of Korea": "KOR",
  "Cote d'Ivoire": "CIV",
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

// ── Group stage sync ──────────────────────────────────────────────────────────
export const syncResults = async () => {
  console.log("🔄 syncResults called at", new Date().toLocaleTimeString());
  try {
    const res = await fetchFromAPI("FINISHED");
    if (!res.ok) { console.error("❌ HTTP error:", res.status); return; }

    const data = await res.json();
    const matches = data.matches;
    if (!matches?.length) { console.warn("⚠️ No finished matches"); return; }

    const updates = {};

    for (const fixture of matches) {
      if (!["GROUP_STAGE", "FIRST_STAGE"].includes(fixture.stage)) continue;

      const homeCode = TEAM_NAME_TO_CODE[fixture.homeTeam.name];
      const awayCode = TEAM_NAME_TO_CODE[fixture.awayTeam.name];
      if (!homeCode || !awayCode) continue;

      const match = GROUP_STAGE_MATCHES.find(
        m => m.home === homeCode && m.away === awayCode
      );
      if (!match) continue;

      const { home: homeScore, away: awayScore } = getScore(fixture);
      const winner = homeScore > awayScore ? homeCode
        : awayScore > homeScore ? awayCode : "DRAW";

      updates[match.id] = { winner, homeScore, awayScore };
    }

    if (!Object.keys(updates).length) { console.log("ℹ️ No group updates"); return; }

    const db = getDatabase();
    await update(ref(db, "results"), updates);
    console.log(`🎉 Synced ${Object.keys(updates).length} group results`);
  } catch (e) {
    console.error("❌ Group sync failed:", e);
  }
};

// ── Knockout sync ─────────────────────────────────────────────────────────────
export const syncKnockoutResults = async () => {
  console.log("🔄 syncKnockoutResults called at", new Date().toLocaleTimeString());
  try {
    const res = await fetchFromAPI("FINISHED");
    if (!res.ok) { console.error("❌ HTTP error:", res.status); return; }

    const data = await res.json();
    const matches = data.matches;
    if (!matches?.length) return;

    const db = getDatabase();

    // Load current knockoutTeams from Firebase to resolve slots → team codes
    const ktSnap = await get(ref(db, "knockoutTeams"));
    const knockoutTeams = ktSnap.exists() ? ktSnap.val() : {};

    // Load existing knockoutResults to avoid redundant writes
    const krSnap = await get(ref(db, "knockoutResults"));
    const existingKOResults = krSnap.exists() ? krSnap.val() : {};

    const KNOCKOUT_STAGE_KEYWORDS = [
      "ROUND_OF_32", "ROUND_OF_16", "QUARTER_FINALS",
      "SEMI_FINALS", "THIRD_PLACE", "FINAL"
    ];

    const koFixtures = matches.filter(f =>
      KNOCKOUT_STAGE_KEYWORDS.includes(f.stage)
    );

    if (!koFixtures.length) {
      console.log("ℹ️ No finished knockout fixtures yet");
      return;
    }

    const koResultUpdates = {};
    const koTeamUpdates = {};

    for (const fixture of koFixtures) {
      const homeCode = TEAM_NAME_TO_CODE[fixture.homeTeam.name];
      const awayCode = TEAM_NAME_TO_CODE[fixture.awayTeam.name];
      if (!homeCode || !awayCode) {
        console.warn("⚠️ Unknown KO team:", fixture.homeTeam.name, fixture.awayTeam.name);
        continue;
      }

      // Find which knockout match this fixture corresponds to
      const koMatch = KNOCKOUT_MATCHES.find(m => {
        const resolvedH = knockoutTeams[m.h] || m.h;
        const resolvedA = knockoutTeams[m.a] || m.a;
        return (
          (resolvedH === homeCode && resolvedA === awayCode) ||
          (resolvedH === awayCode && resolvedA === homeCode)
        );
      });

      if (!koMatch) {
        console.warn("⚠️ KO match not found for:", homeCode, "vs", awayCode);
        continue;
      }

      // Skip if already recorded
      if (existingKOResults[koMatch.id]?.winner) continue;

      const { home: homeScore, away: awayScore } = getScore(fixture);

      let winner;
      if (fixture.score?.winner === "HOME_TEAM") winner = homeCode;
      else if (fixture.score?.winner === "AWAY_TEAM") winner = awayCode;
      else if (homeScore > awayScore) winner = homeCode;
      else if (awayScore > homeScore) winner = awayCode;
      else {
        console.warn("⚠️ Cannot determine KO winner for", koMatch.id);
        continue;
      }

      console.log(`🏆 KO: ${homeCode} vs ${awayCode} → winner: ${winner} (${koMatch.id})`);
      koResultUpdates[koMatch.id] = { winner, homeScore, awayScore };

      // Auto-advance winner into next round slot
      const winnerSlot = `W${koMatch.id}`;
      koTeamUpdates[winnerSlot] = winner;

      // SF losers go to Bronze
      if (koMatch.round === "SF") {
        const loser = winner === homeCode ? awayCode : homeCode;
        const loserSlot = `L${koMatch.id}`;
        koTeamUpdates[loserSlot] = loser;
      }
    }

    if (Object.keys(koResultUpdates).length) {
      await update(ref(db, "knockoutResults"), koResultUpdates);
      console.log(`🎉 Synced ${Object.keys(koResultUpdates).length} knockout results`);
    }

    if (Object.keys(koTeamUpdates).length) {
      await update(ref(db, "knockoutTeams"), koTeamUpdates);
      console.log(`✅ Advanced ${Object.keys(koTeamUpdates).length} teams to next round`);
    }

  } catch (e) {
    console.error("❌ Knockout sync failed:", e);
  }
};

// ── Live scores ───────────────────────────────────────────────────────────────
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
        m => m.home === homeCode && m.away === awayCode
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