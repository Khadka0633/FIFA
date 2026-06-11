import * as XLSX from "xlsx";
import { GROUP_STAGE_MATCHES, getTeam, GROUPS } from "../data/matches";

export const exportPredictions = (players) => {
  const workbook = XLSX.utils.book_new();

  const rows = Object.values(players).map((player) => {
    const row = {
      "Player":            player.name,
      "Country":           player.avatarFlag?.name || "—",
      "Submitted At":      player.submittedAt
        ? new Date(player.submittedAt).toLocaleString()
        : "—",
      "Total Predicted":   Object.keys(player.predictions || {}).length,
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

  XLSX.utils.book_append_sheet(workbook, ws, "All Predictions");
  XLSX.writeFile(workbook, "WC2026_Predictions.xlsx");
  console.log("✅ Exported!");
};