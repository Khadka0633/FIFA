// Points: 2 for correct result (win/draw), 0 for wrong
export const calculateScore = (predictions, results) => {
  let score = 0;
  let correct = 0;
  let total = 0;

  Object.entries(results).forEach(([matchId, result]) => {
    if (predictions[matchId] !== undefined) {
      total++;
      if (predictions[matchId] === result) {
        score += 2;
        correct++;
      }
    }
  });

  return { score, correct, total };
};

export const buildLeaderboard = (players, results) => {
  return Object.values(players)
    .map((player) => {
      const { score, correct, total } = calculateScore(player.predictions || {}, results);
      return {
        ...player,
        score,
        correct,
        total,
        accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      };
    })
    .sort((a, b) => b.score - a.score || b.correct - a.correct);
};
