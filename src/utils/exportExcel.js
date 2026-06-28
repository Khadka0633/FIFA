import * as XLSX from "xlsx";
import { GROUP_STAGE_MATCHES, getTeam, GROUPS } from "../data/matches";
import { KNOCKOUT_MATCHES, ROUND_LABELS } from "../data/KnockoutMatches";

// ── Group stage export (existing) ─────────────────────────────────────────────
export const exportPredictions = (players) => {
  const workbook = XLSX.utils.book_new();

  const rows = Object.values(players).map((player) => {
    const row = {
      "Player":          player.name,
      "Country":         player.avatarFlag?.name || "—",
      "Submitted At":    player.submittedAt
        ? new Date(player.submittedAt).toLocaleString()
        : "—",
      "Total Predicted": Object.keys(player.predictions || {}).length,
    };

    GROUPS.forEach((group) => {
      const groupMatches = GROUP_STAGE_MATCHES.filter((m) => m.group === group);
      groupMatches.forEach((match) => {
        const home = getTeam(match.home);
        const away = getTeam(match.away);
        const colName = `[${group}] ${home.code} vs ${away.code}`;
        const pred = player.predictions?.[match.id];

        if (!pred)                row[colName] = "—";
        else if (pred === "DRAW") row[colName] = "Draw";
        else                      row[colName] = getTeam(pred).code;
      });
    });

    return row;
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [
    { wch: 18 }, { wch: 15 }, { wch: 20 }, { wch: 16 },
    ...GROUP_STAGE_MATCHES.map(() => ({ wch: 14 })),
  ];

  XLSX.utils.book_append_sheet(workbook, ws, "Group Stage Predictions");
  XLSX.writeFile(workbook, "WC2026_GroupStage_Predictions.xlsx");
  console.log("✅ Group stage exported!");
};

// ── Knockout export (new) ─────────────────────────────────────────────────────
export const exportKnockoutPredictions = (players, knockoutTeams = {}) => {
  const workbook = XLSX.utils.book_new();

  // Filter only players who submitted knockout predictions
  const knockoutPlayers = Object.values(players).filter(
    (p) => p.knockoutPredictions && p.knockoutLocked
  );

  if (knockoutPlayers.length === 0) {
    alert("No knockout predictions submitted yet.");
    return;
  }

  const rows = knockoutPlayers.map((player) => {
    const row = {
      "Player":                player.name,
      "Country":               player.avatarFlag?.name || "—",
      "KO Submitted At":       player.knockoutSubmittedAt
        ? new Date(player.knockoutSubmittedAt).toLocaleString()
        : "—",
      "Total KO Predicted":    Object.keys(player.knockoutPredictions || {}).length,
    };

    // Group by round for clarity
    const roundOrder = ["R32", "R16", "QF", "SF", "Bronze", "Final"];

    roundOrder.forEach((round) => {
      const roundMatches = KNOCKOUT_MATCHES.filter((m) => m.round === round);
      roundMatches.forEach((match) => {
        // Resolve slot names to team codes using knockoutTeams
        const homeCode = knockoutTeams[match.h] || match.h;
        const awayCode = knockoutTeams[match.a] || match.a;

        const homeLabel = /^[A-Z]{3}$/.test(homeCode)
          ? getTeam(homeCode).code
          : match.h;
        const awayLabel = /^[A-Z]{3}$/.test(awayCode)
          ? getTeam(awayCode).code
          : match.a;

        const colName = `[${ROUND_LABELS[round]}] ${homeLabel} vs ${awayLabel}`;
        const pred = player.knockoutPredictions?.[match.id];

        if (!pred) row[colName] = "—";
        else        row[colName] = /^[A-Z]{3}$/.test(pred) ? getTeam(pred).code : pred;
      });
    });

    return row;
  });

  const ws = XLSX.utils.json_to_sheet(rows);

  // Column widths
  ws["!cols"] = [
    { wch: 18 }, // Player
    { wch: 15 }, // Country
    { wch: 22 }, // KO Submitted At
    { wch: 18 }, // Total KO Predicted
    ...KNOCKOUT_MATCHES.map(() => ({ wch: 20 })),
  ];

  // Style header row bold (basic)
  const range = XLSX.utils.decode_range(ws["!ref"]);
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddr = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!ws[cellAddr]) continue;
    ws[cellAddr].s = { font: { bold: true } };
  }

  XLSX.utils.book_append_sheet(workbook, ws, "Knockout Predictions");
  XLSX.writeFile(workbook, "WC2026_Knockout_Predictions.xlsx");
  console.log(`✅ Knockout predictions exported for ${knockoutPlayers.length} players!`);
};