// ============================================================
// FIFA WORLD CUP 2026 — KNOCKOUT STAGE MATCH DEFINITIONS
// ============================================================

export const KNOCKOUT_ROUNDS = ["R32", "R16", "QF", "SF", "Bronze", "Final"];

export const ROUND_LABELS = {
  R32: "Round of 32",
  R16: "Round of 16",
  QF: "Quarter Finals",
  SF: "Semi Finals",
  Bronze: "Bronze",
  Final: "Final",
};

// Flat 2pts per correct knockout pick (same as group stage)
export const KNOCKOUT_POINT_MAP = {
  R32: 2, R16: 2, QF: 2, SF: 2, Bronze: 2, Final: 2,
};

// ── Match definitions ─────────────────────────────────────────────────────────
// h / a = slot codes that resolve to team codes via knockoutTeams in Firebase
// W{id} = winner of that match advances to next round slot
// L{SF_id} = loser of SF goes to Bronze

export const KNOCKOUT_MATCHES = [
  // ── Round of 32 ──────────────────────────────────────────────────────────
  { id: "R32_1",  round: "R32",    h: "1E",    a: "3AB",   date: "Jun 30" },
  { id: "R32_2",  round: "R32",    h: "1I",    a: "3CD",   date: "Jul 1"  },
  { id: "R32_3",  round: "R32",    h: "2A",    a: "2B",    date: "Jun 28" },
  { id: "R32_4",  round: "R32",    h: "1F",    a: "2C",    date: "Jun 30" },
  { id: "R32_5",  round: "R32",    h: "2K",    a: "2L",    date: "Jul 3"  },
  { id: "R32_6",  round: "R32",    h: "1H",    a: "2J",    date: "Jul 2"  },
  { id: "R32_7",  round: "R32",    h: "1D",    a: "3BE",   date: "Jul 2"  },
  { id: "R32_8",  round: "R32",    h: "1G",    a: "3AE",   date: "Jul 1"  },
  { id: "R32_9",  round: "R32",    h: "1C",    a: "2F",    date: "Jun 29" },
  { id: "R32_10", round: "R32",    h: "2E",    a: "2I",    date: "Jun 30" },
  { id: "R32_11", round: "R32",    h: "1A",    a: "3CE",   date: "Jul 1"  },
  { id: "R32_12", round: "R32",    h: "1L",    a: "3EH",   date: "Jul 1"  },
  { id: "R32_13", round: "R32",    h: "1J",    a: "2H",    date: "Jul 4"  },
  { id: "R32_14", round: "R32",    h: "2D",    a: "2G",    date: "Jul 3"  },
  { id: "R32_15", round: "R32",    h: "1B",    a: "3EF",   date: "Jul 3"  },
  { id: "R32_16", round: "R32",    h: "1K",    a: "3DE",   date: "Jul 4"  },

  // ── Round of 16 ──────────────────────────────────────────────────────────
  // Winners of R32 pairs advance: WR32_1 = winner of R32_1, etc.
  { id: "R16_1",  round: "R16",    h: "WR32_1",  a: "WR32_2",  date: "Jul 5"  },
  { id: "R16_2",  round: "R16",    h: "WR32_3",  a: "WR32_4",  date: "Jul 4"  },
  { id: "R16_3",  round: "R16",    h: "WR32_5",  a: "WR32_6",  date: "Jul 6"  },
  { id: "R16_4",  round: "R16",    h: "WR32_7",  a: "WR32_8",  date: "Jul 7"  },
  { id: "R16_5",  round: "R16",    h: "WR32_9",  a: "WR32_10", date: "Jul 5"  },
  { id: "R16_6",  round: "R16",    h: "WR32_11", a: "WR32_12", date: "Jul 6"  },
  { id: "R16_7",  round: "R16",    h: "WR32_13", a: "WR32_14", date: "Jul 7"  },
  { id: "R16_8",  round: "R16",    h: "WR32_15", a: "WR32_16", date: "Jul 7"  },

  // ── Quarter Finals ────────────────────────────────────────────────────────
  { id: "QF1",    round: "QF",     h: "WR16_1",  a: "WR16_2",  date: "Jul 9"  },
  { id: "QF2",    round: "QF",     h: "WR16_3",  a: "WR16_4",  date: "Jul 10" },
  { id: "QF3",    round: "QF",     h: "WR16_5",  a: "WR16_6",  date: "Jul 12" },
  { id: "QF4",    round: "QF",     h: "WR16_7",  a: "WR16_8",  date: "Jul 12" },

  // ── Semi Finals ───────────────────────────────────────────────────────────
  { id: "SF1",    round: "SF",     h: "WQF1",    a: "WQF2",    date: "Jul 14" },
  { id: "SF2",    round: "SF",     h: "WQF3",    a: "WQF4",    date: "Jul 15" },

  // ── Bronze ────────────────────────────────────────────────────────────────
  // Losers of SF1 and SF2
  { id: "B1",     round: "Bronze", h: "LSF1",    a: "LSF2",    date: "Jul 19" },

  // ── Final ─────────────────────────────────────────────────────────────────
  { id: "F1",     round: "Final",  h: "WSF1",    a: "WSF2",    date: "Jul 19" },
];