import { useState, useEffect } from "react";
import { GROUP_STAGE_MATCHES, GROUPS, getTeam } from "../data/matches";
import FlagImg from "./FlagImg";

// Simple confetti component
function Confetti() {
  const colors = ["#FFD700", "#FFC200", "#003F88", "#7BA3D4", "#ffffff", "#ff4444", "#44ff88"];
  const pieces = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    color: colors[Math.floor(Math.random() * colors.length)],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 1.5}s`,
    duration: `${2 + Math.random() * 2}s`,
    size: `${6 + Math.random() * 8}px`,
    rotation: `${Math.random() * 360}deg`,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute top-0 animate-bounce"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
            transform: `rotate(${p.rotation})`,
            animation: `fall ${p.duration} ${p.delay} ease-in forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function SubmitPreview({ player, predictions, onConfirm, onBack, saving }) {
  const totalMatches = GROUP_STAGE_MATCHES.length;
  const predicted = Object.keys(predictions).length;
  const [showConfetti, setShowConfetti] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const getPredictionDisplay = (matchId) => {
    const pred = predictions[matchId];
    if (!pred) return { label: "—", iso: null, color: "text-red-400" };
    if (pred === "DRAW") return { label: "Draw", iso: null, color: "text-[#7BA3D4]" };
    const team = getTeam(pred);
    return { label: team.name, iso: team.iso, color: "text-white" };
  };

  const handleConfirm = async () => {
    setShowConfetti(true);
    setSubmitted(true);
    await onConfirm();
    setTimeout(() => setShowConfetti(false), 4000);
  };

  return (
    <>
      {showConfetti && <Confetti />}

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
                          <FlagImg iso={home.iso} size={16} className="rounded-sm flex-shrink-0" />
                          <span className="text-[#7BA3D4] text-xs flex-1 truncate">{home.code} vs {away.code}</span>
                          <FlagImg iso={away.iso} size={16} className="rounded-sm flex-shrink-0" />
                          <div className="ml-2 flex items-center gap-1.5 min-w-[90px] justify-end">
                            {pred.iso
                              ? <FlagImg iso={pred.iso} size={16} className="rounded-sm" />
                              : <span className="text-sm">{isPredicted ? "🤝" : "❓"}</span>
                            }
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
                onClick={handleConfirm}
                disabled={saving || predicted < totalMatches}
                className="flex-1 bg-[#FFD700] hover:bg-[#FFC200] disabled:opacity-40 disabled:cursor-not-allowed text-[#001A3D] font-black py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {saving ? "🎉 Saving..." : "LOCK IN MY PICKS 🔒"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}