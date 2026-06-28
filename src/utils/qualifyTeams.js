// qualifyTeams.js
// Auto-calculates group standings and writes R32 match pairs to Firebase
// Output format: knockoutTeams/R32_1: { home: "GER", away: "PAR" }

import { GROUP_STAGE_MATCHES, GROUPS } from "../data/matches";
import { getDatabase, ref, update, onValue } from "firebase/database";

// ── R32 bracket structure ─────────────────────────────────────────────────────
// Each entry maps a match ID to its two slot codes
// Slot codes: "1X" = group X winner, "2X" = runner-up, "3XY" = 3rd place slot
const R32_BRACKET = [
  // LEFT BRACKET
  { id: "R32_1",  home: "1E", away: "3CD" },  // GER vs PAR ✅
  { id: "R32_2",  home: "1I", away: "3AB" },  // FRA vs SWE ✅
  { id: "R32_3",  home: "2A", away: "2B"  },  // RSA vs CAN ✅
  { id: "R32_4",  home: "1F", away: "2C"  },  // NED vs MAR ✅
  { id: "R32_5",  home: "1K", away: "3EH" },  // COL vs GHA ✅ (was 2K vs 2L — WRONG)
  { id: "R32_6",  home: "1H", away: "2J"  },  // ESP vs AUT ✅
  { id: "R32_7",  home: "1D", away: "3BE" },  // USA vs BIH ✅
  { id: "R32_8",  home: "1G", away: "3AE" },  // BEL vs SEN ✅
  // RIGHT BRACKET
  { id: "R32_9",  home: "1A", away: "3DE" },  // MEX vs ECU ✅ (3DE = ECU confirmed)
  { id: "R32_10", home: "2E", away: "2I"  },  // CIV vs NOR ✅
  { id: "R32_11", home: "1L", away: "3CE" },  // ENG vs COD ✅
  { id: "R32_12", home: "1B", away: "3EF" },  // SUI vs ALG ✅
  { id: "R32_13", home: "1J", away: "2H"  },  // ARG vs CPV ✅
  { id: "R32_14", home: "2D", away: "2G"  },  // AUS vs EGY ✅
  { id: "R32_15", home: "2K", away: "2L"  },  // POR vs CRO ✅ (was duplicate — WRONG)
  { id: "R32_16", home: "1C", away: "2F"  },  // BRA vs JPN ✅ (was 1K vs 3EH — WRONG)
];
// ── SLOT MAP ──────────────────────────────────────────────────────────────────
// 3rd place slots use "direct" (confirmed from actual bracket Jun 28 2026)
// Winners/runners-up use { group, pos }
export const SLOT_MAP = {
  // Group winners
  "1A": { group: "A", pos: 1 },
  "1B": { group: "B", pos: 1 },
  "1C": { group: "C", pos: 1 },
  "1D": { group: "D", pos: 1 },
  "1E": { group: "E", pos: 1 },
  "1F": { group: "F", pos: 1 },
  "1G": { group: "G", pos: 1 },
  "1H": { group: "H", pos: 1 },
  "1I": { group: "I", pos: 1 },
  "1J": { group: "J", pos: 1 },
  "1K": { group: "K", pos: 1 },
  "1L": { group: "L", pos: 1 },

  // Group runners-up
  "2A": { group: "A", pos: 2 },
  "2B": { group: "B", pos: 2 },
  "2C": { group: "C", pos: 2 },
  "2D": { group: "D", pos: 2 },
  "2E": { group: "E", pos: 2 },
  "2F": { group: "F", pos: 2 },
  "2G": { group: "G", pos: 2 },
  "2H": { group: "H", pos: 2 },
  "2I": { group: "I", pos: 2 },
  "2J": { group: "J", pos: 2 },
  "2K": { group: "K", pos: 2 },
  "2L": { group: "L", pos: 2 },

  // 3rd place — CONFIRMED from actual WC 2026 bracket (Jun 28 2026)
  "3AB": { direct: "SWE" }, // Group F 3rd (SWE) → vs FRA  (R32_2)
  "3AE": { direct: "SEN" }, // Group I 3rd (SEN) → vs BEL  (R32_8)
  "3BE": { direct: "BIH" }, // Group B 3rd (BIH) → vs USA  (R32_7)
  "3CD": { direct: "PAR" }, // Group D 3rd (PAR) → vs GER  (R32_1)
  "3CE": { direct: "COD" }, // Group K 3rd (COD) → vs ENG  (R32_11)
  "3DE": { direct: "ECU" }, // Group E 3rd (ECU) → vs MEX  (R32_9)
  "3EF": { direct: "ALG" }, // Group J 3rd (ALG) → vs SUI  (R32_12)
  "3EH": { direct: "GHA" }, // Group L 3rd (GHA) → vs COL  (R32_16)
};

// ── Calculate standings for one group ────────────────────────────────────────
export function calcGroupStandings(group, results) {
  const matches = GROUP_STAGE_MATCHES.filter(m => m.group === group);
  const teams = {};

  matches.forEach(m => {
    if (!teams[m.home]) teams[m.home] = { code: m.home, p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 };
    if (!teams[m.away]) teams[m.away] = { code: m.away, p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 };
  });

  matches.forEach(m => {
    const res = results[m.id];
    if (!res) return;
    const winner = typeof res === "object" ? res.winner : res;
    const hg = typeof res === "object" ? (res.homeScore ?? 0) : 0;
    const ag = typeof res === "object" ? (res.awayScore ?? 0) : 0;

    teams[m.home].p++;  teams[m.away].p++;
    teams[m.home].gf += hg; teams[m.home].ga += ag;
    teams[m.away].gf += ag; teams[m.away].ga += hg;

    if (winner === m.home) {
      teams[m.home].w++; teams[m.home].pts += 3; teams[m.away].l++;
    } else if (winner === m.away) {
      teams[m.away].w++; teams[m.away].pts += 3; teams[m.home].l++;
    } else if (winner === "DRAW") {
      teams[m.home].d++; teams[m.home].pts++;
      teams[m.away].d++; teams[m.away].pts++;
    }
  });

  const teamList = Object.values(teams);

  // ── Head-to-head helper ───────────────────────────────────
  const getH2H = (tiedTeams) => {
    const codes = new Set(tiedTeams.map(t => t.code));
    const h2h = {};
    tiedTeams.forEach(t => { h2h[t.code] = { pts:0, gf:0, ga:0 }; });

    matches.forEach(m => {
      if (!codes.has(m.home) || !codes.has(m.away)) return;
      const res = results[m.id];
      if (!res) return;
      const winner = typeof res === "object" ? res.winner : res;
      const hg = typeof res === "object" ? (res.homeScore ?? 0) : 0;
      const ag = typeof res === "object" ? (res.awayScore ?? 0) : 0;

      h2h[m.home].gf += hg; h2h[m.home].ga += ag;
      h2h[m.away].gf += ag; h2h[m.away].ga += hg;

      if (winner === m.home)       h2h[m.home].pts += 3;
      else if (winner === m.away)  h2h[m.away].pts += 3;
      else if (winner === "DRAW") { h2h[m.home].pts++; h2h[m.away].pts++; }
    });

    return h2h;
  };

  // ── FIFA tiebreakers ──────────────────────────────────────
  return teamList.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;

    const tiedTeams = teamList.filter(t => t.pts === a.pts);
    if (tiedTeams.length > 1 && tiedTeams.length < teamList.length) {
      const h2h = getH2H(tiedTeams);
      if (h2h[b.code].pts !== h2h[a.code].pts)
        return h2h[b.code].pts - h2h[a.code].pts;
      const gdA = h2h[a.code].gf - h2h[a.code].ga;
      const gdB = h2h[b.code].gf - h2h[b.code].ga;
      if (gdB !== gdA) return gdB - gdA;
      if (h2h[b.code].gf !== h2h[a.code].gf)
        return h2h[b.code].gf - h2h[a.code].gf;
    }

    const gdA = a.gf - a.ga, gdB = b.gf - b.ga;
    if (gdB !== gdA) return gdB - gdA;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.code.localeCompare(b.code);
  });
}

// ── Check if all matches in a group have results ──────────────────────────────
export function isGroupComplete(group, results) {
  return GROUP_STAGE_MATCHES
    .filter(m => m.group === group)
    .every(m => results[m.id]);
}

// ── Resolve a single slot code → team code ────────────────────────────────────
export function resolveSlot(slotCode, allStandings) {
  const rule = SLOT_MAP[slotCode];
  if (!rule) return null;

  // Confirmed 3rd place direct assignment
  if (rule.direct) return rule.direct;

  // Group winner or runner-up
  if (rule.group && rule.pos) {
    return allStandings[rule.group]?.[rule.pos - 1]?.code || null;
  }

  return null;
}

// ── Resolve all R32 slots → match pairs ──────────────────────────────────────
// Returns: { R32_1: { home: "GER", away: "PAR" }, R32_2: {...}, ... }
export function resolveKnockoutSlots(results) {
  // Build standings for every group
  const allStandings = {};
  GROUPS.forEach(g => {
    allStandings[g] = calcGroupStandings(g, results);
  });

  const resolved = {};

  R32_BRACKET.forEach(({ id, home: hSlot, away: aSlot }) => {
    const homeCode = resolveSlot(hSlot, allStandings);
    const awayCode = resolveSlot(aSlot, allStandings);

    // Only write if BOTH teams are resolved
    if (homeCode && awayCode) {
      resolved[id] = { home: homeCode, away: awayCode };
    }
  });

  return resolved;
}

// ── Write match pairs to Firebase ────────────────────────────────────────────
// Writes: knockoutTeams/R32_1: { home: "GER", away: "PAR" }
export async function syncKnockoutTeams(results) {
  const completedGroups = GROUPS.filter(g => isGroupComplete(g, results));
  if (completedGroups.length === 0) return;

  const resolved = resolveKnockoutSlots(results);
  if (Object.keys(resolved).length === 0) return;

  console.log(
    `✅ Syncing knockout teams (${completedGroups.length}/12 groups complete):`,
    resolved
  );

  // ✅ resolved is { R32_1: {home,away}, R32_2: {home,away}, ... }
  // NOT slot strings — matches what KnockoutBracket expects
  const db = getDatabase();
  await update(ref(db, "knockoutTeams"), resolved);
}

// ── Firebase realtime listener for knockout teams ─────────────────────────────
export function getKnockoutTeams(callback) {
  const db = getDatabase();
  return onValue(ref(db, "knockoutTeams"), snap => {
    callback(snap.exists() ? snap.val() : {});
  });
}
