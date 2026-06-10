import { GROUP_STAGE_MATCHES, GROUPS, getTeam } from "../data/matches";

export default function SubmitPreview({ player, predictions, onConfirm, onBack, saving }) {
  const totalMatches = GROUP_STAGE_MATCHES.length;
  const predicted = Object.keys(predictions).length;

  const getPredictionDisplay = (matchId) => {
    const pred = predictions[matchId];
    if (!pred) return { label: "—", flag: "❓", color: "text-red-400" };
    if (pred === "DRAW") return { label: "Draw", flag: "🤝", color: "text-[#7BA3D4]" };
    const team = getTeam(pred);
    return { label: team.name, flag: team.flag, color: "text-white" };
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto py-6 px-4">
      <div className="bg-[#002657] border border-[#003F88] rounded-2xl w-full max-w-2xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-[#002657] border-b border-[#003F88] rounded-t-2xl px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-black text-xl">Review Your Predictions</h2>
            <p className="text-[#7BA3D4] text-xs mt-0.5">
              <span className="text-[#FFD700] font-bold">{player.name}</span> · {predicted}/{totalMatches} matches predicted
            </p>
          </div>
          <button onClick={onBack} className="text-[#4A6B8A] hover:text-white transition-colors text-sm">
            ✕ Back
          </button>
        </div>

        {/* Warning if incomplete */}
        {predicted < totalMatches && (
          <div className="mx-6 mt-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
            ⚠️ {totalMatches - predicted} matches are missing predictions. You cannot submit yet.
          </div>
        )}

        {/* Predictions by group */}
        <div className="px-6 pb-4">
          {GROUPS.map((group) => {
            const groupMatches = GROUP_STAGE_MATCHES.filter((m) => m.group === group);
            return (
              <div key={group} className="mt-5">
                <h3 className="text-[#FFD700] text-xs font-black uppercase tracking-widest mb-2">
                  Group {group}
                </h3>
                <div className="space-y-1.5">
                  {groupMatches.map((match) => {
                    const home = getTeam(match.home);
                    const away = getTeam(match.away);
                    const pred = getPredictionDisplay(match.id);
                    const isPredicted = predictions[match.id];

                    return (
                      <div
                        key={match.id}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                          isPredicted ? "bg-[#001A3D]" : "bg-red-500/5 border border-red-500/20"
                        }`}
                      >
                        <span className="text-sm">{home.flag}</span>
                        <span className="text-[#7BA3D4] text-xs flex-1 truncate">{home.code} vs {away.code}</span>
                        <span className="text-sm">{away.flag}</span>
                        <div className="ml-2 flex items-center gap-1 min-w-[80px] justify-end">
                          <span className="text-sm">{pred.flag}</span>
                          <span className={`text-xs font-bold ${pred.color} truncate`}>{pred.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#002657] border-t border-[#003F88] rounded-b-2xl px-6 py-4">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 mb-4 text-xs text-yellow-300">
            🔒 <strong>Once submitted, your predictions are permanently locked.</strong> You cannot change them after this point.
          </div>
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="flex-1 bg-[#001A3D] border border-[#003F88] text-[#7BA3D4] font-bold py-3 rounded-xl hover:border-[#7BA3D4] hover:text-white transition-all"
            >
              ← Edit Predictions
            </button>
            <button
              onClick={onConfirm}
              disabled={saving || predicted < totalMatches}
              className="flex-1 bg-[#FFD700] hover:bg-[#FFC200] disabled:opacity-40 disabled:cursor-not-allowed text-[#001A3D] font-black py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {saving ? "Saving..." : "LOCK IN MY PICKS 🔒"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
