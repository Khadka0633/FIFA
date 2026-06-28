import { KNOCKOUT_POINT_MAP } from "../data/knockoutMatches";

export const calculateKnockoutScore = (predictions, results) => {
  let score = 0;
  let correct = 0;
  let total = 0;

  Object.entries(results).forEach(([matchId, result]) => {
    const winner = typeof result === "object" ? result.winner : result;
    if (predictions[matchId] !== undefined) {
      total++;
      if (predictions[matchId] === winner) {
        // Find round for this match to get points
        score += 2; // flat 2pts as decided
        correct++;
      }
    }
  });

  return { score, correct, total };
};

export const buildKnockoutLeaderboard = (players, knockoutResults) => {
  return Object.values(players)
    .filter(p => p.knockoutPredictions && p.knockoutLocked)
    .map(player => {
      const { score, correct, total } = calculateKnockoutScore(
        player.knockoutPredictions || {},
        knockoutResults
      );
      return {
        ...player,
        score,
        correct,
        total,
      };
    })
    .sort((a, b) => b.score - a.score || b.correct - a.correct);
};