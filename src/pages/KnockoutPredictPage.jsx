import { useState, useEffect } from "react";
import { KNOCKOUT_MATCHES, KNOCKOUT_ROUNDS } from "../data/KnockoutMatches";
import KnockoutPredictCard from "../components/KnockoutPredictCard";
import { saveKnockoutPredictions, getKnockoutResults } from "../utils/firebase";
import FlagImg from "../components/FlagImg";

export default function KnockoutPredictPage({ player, knockoutTeams, onSubmitted, alreadyLocked, existingPredictions }) {
  const [predictions, setPredictions] = useState(existingPredictions || {});
  const [activeRound, setActiveRound] = useState("R32");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [results, setResults] = useState({});
  const [showPreview, setShowPreview] = useState(false);






   if (player?.name === "Guest") {
    return (
      <div className="min-h-screen bg-[#001A3D] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-6xl mb-4">🔒</p>
          <h2 className="text-white font-black text-2xl mb-2">Login Required</h2>
          <p className="text-[#7BA3D4] text-sm max-w-xs mx-auto mb-6">
            You need to create an account and submit group stage predictions before making knockout picks.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-[#FFD700] hover:bg-[#FFC200] text-[#001A3D] font-black px-6 py-3 rounded-xl transition-all"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const unsub = getKnockoutResults(setResults);
    return () => { if (typeof unsub === "function") unsub(); };
  }, []);

  const rounds = ["R32", "R16", "QF", "SF", "Final"];
  const roundLabels = { R32: "Round of 32", R16: "Round of 16", QF: "Quarter Finals", SF: "Semi Finals", Final: "Final" };

  const roundMatches = KNOCKOUT_MATCHES.filter(m => m.round === activeRound);

  // Count predictable matches (both teams known)
  const predictable = KNOCKOUT_MATCHES.filter(m => {
    const h = knockoutTeams?.[m.h] || m.h;
    const a = knockoutTeams?.[m.a] || m.a;
    return /^[A-Z]{3}$/.test(h) && /^[A-Z]{3}$/.test(a);
  });
  const predicted = predictable.filter(m => predictions[m.id]).length;

  const handlePick = (matchId, value) => {
    if (alreadyLocked) return;
    setPredictions(prev => ({ ...prev, [matchId]: value }));
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleSubmit = async () => {
    if (predicted < predictable.length) {
      return showToast(`⚠️ ${predictable.length - predicted} match${predictable.length - predicted > 1 ? "es" : ""} still unpicked.`);
    }
    setSaving(true);
    try {
      await saveKnockoutPredictions(player.name, predictions, player.avatarFlag);
      onSubmitted(predictions);
    } catch (e) {
      showToast("❌ Failed to save. Try again.");
    }
    setSaving(false);


  };




  return (
    <div className="min-h-screen bg-[#001A3D]">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#001A3D]/95 backdrop-blur border-b border-[#003F88]">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <FlagImg iso={player.avatarFlag.iso} size={28} className="rounded-sm flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-white font-black text-sm truncate leading-tight">{player.name}</p>
              <p className="text-[#4A6B8A] text-[10px] uppercase tracking-wider">Knockout Predictions</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right">
              <p className="text-[#FFD700] text-xs font-bold">{predicted}/{predictable.length}</p>
              <p className="text-[#4A6B8A] text-[9px] uppercase">picked</p>
            </div>
            {!alreadyLocked && (
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="bg-[#FFD700] hover:bg-[#FFC200] disabled:opacity-50 text-[#001A3D] font-black text-xs py-2 px-3 rounded-lg transition-all hover:scale-105 active:scale-95"
              >
                {saving ? "Saving..." : "LOCK IN 🔒"}
              </button>
            )}
            {alreadyLocked && (
              <span className="bg-green-500/10 text-green-400 text-[10px] font-black px-3 py-1.5 rounded-lg border border-green-500/30">
                🔒 LOCKED
              </span>
            )}
          </div>
        </div>

        {/* Round tabs */}
        <div className="max-w-4xl mx-auto px-4 pb-3 flex gap-1.5 overflow-x-auto scrollbar-none">
          {rounds.map(r => (
            <button
              key={r}
              onClick={() => setActiveRound(r)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                activeRound === r ? "bg-[#FFD700] text-[#001A3D]" : "bg-[#002657] text-[#7BA3D4] hover:bg-[#003F88]"
              }`}
            >
              {roundLabels[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Matches */}
      <div className="max-w-4xl mx-auto px-4 py-5">
        {alreadyLocked && (
          <div className="mb-4 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 text-green-400 text-sm font-medium">
            🔒 Your knockout predictions are locked in. Good luck!
          </div>
        )}
        <h2 className="text-white font-black text-lg mb-4">{roundLabels[activeRound]}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {roundMatches.map(match => (
            <KnockoutPredictCard
              key={match.id}
              match={match}
              round={activeRound}
              knockoutTeams={knockoutTeams}
              prediction={predictions[match.id]}
              onPick={handlePick}
              locked={alreadyLocked}
              result={results[match.id]}
            />
          ))}
        </div>
      </div>

      

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#002657] border border-[#003F88] text-white text-sm font-medium px-5 py-3 rounded-xl shadow-2xl z-50 animate-bounce-in">
          {toast}
        </div>
      )}
    </div>
  );
}