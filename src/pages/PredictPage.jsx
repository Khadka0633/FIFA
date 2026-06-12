import { useState, useEffect } from "react";
import { GROUP_STAGE_MATCHES, GROUPS, getTeam } from "../data/matches";
import MatchCard from "../components/MatchCard";
import SubmitPreview from "../components/SubmitPreview";
import { savePredictions, getResults } from "../utils/firebase";
import FlagImg from "../components/FlagImg";



export default function PredictPage({ player, onSubmitted }) {
  const [predictions, setPredictions] = useState({});
  const [activeGroup, setActiveGroup] = useState("A");
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [results, setResults] = useState({});

  const totalMatches = GROUP_STAGE_MATCHES.length;
  const predicted = Object.keys(predictions).length;
  const progress = Math.round((predicted / totalMatches) * 100);

  const groupMatches = GROUP_STAGE_MATCHES.filter((m) => m.group === activeGroup);
  const groupPredicted = groupMatches.filter((m) => predictions[m.id]).length;

  const handlePick = (matchId, value) => {
    setPredictions((prev) => ({ ...prev, [matchId]: value }));
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handlePreview = () => {
    if (predicted < totalMatches) {
      const missing = totalMatches - predicted;
      return showToast(`⚠️ You have ${missing} match${missing > 1 ? "es" : ""} left to predict.`);
    }
    setShowPreview(true);
  };

  const handleConfirmSubmit = async () => {
    setSaving(true);
    try {
      await savePredictions(player.name, predictions, player.avatarFlag);
      onSubmitted(predictions);
    } catch (e) {
      showToast("❌ Failed to save. Please try again.");
    }
    setSaving(false);
  };





useEffect(() => {
  const unsub = getResults(setResults);
  return () => { if (typeof unsub === "function") unsub(); };
}, []);


  return (
    <div className="min-h-screen bg-[#001A3D]">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#001A3D]/95 backdrop-blur border-b border-[#003F88]">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <FlagImg iso={player.avatarFlag.iso} size={28} className="rounded-sm flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-white font-black text-sm truncate leading-tight">{player.name}</p>
              <p className="text-[#4A6B8A] text-[10px] uppercase tracking-wider">Group Stage Predictions</p>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right">
              <p className="text-[#FFD700] text-xs font-bold">{predicted}/{totalMatches}</p>
              <p className="text-[#4A6B8A] text-[9px] uppercase">predicted</p>
            </div>
            <div className="w-16 h-2 bg-[#002657] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FFD700] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

        {/* <button
            onClick={handlePreview}
            className="bg-[#FFD700] hover:bg-[#FFC200] text-[#001A3D] font-black text-xs py-2 px-3 rounded-lg transition-all hover:scale-105 active:scale-95 flex-shrink-0"
          >
            SUBMIT ⚽
          </button>
          */}

          
        </div>

        {/* Group tabs */}
        <div className="max-w-4xl mx-auto px-4 pb-3 flex gap-1.5 overflow-x-auto scrollbar-none">
          {GROUPS.map((g) => {
            const gMatches = GROUP_STAGE_MATCHES.filter((m) => m.group === g);
            const gDone = gMatches.filter((m) => predictions[m.id]).length;
            const gComplete = gDone === gMatches.length;
            return (
              <button
                key={g}
                onClick={() => setActiveGroup(g)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-black transition-all relative ${
                  activeGroup === g
                    ? "bg-[#FFD700] text-[#001A3D]"
                    : "bg-[#002657] text-[#7BA3D4] hover:bg-[#003F88]"
                }`}
              >
                GROUP {g}
                {gComplete && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full text-[6px] flex items-center justify-center text-white font-black">✓</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Matches */}
      <div className="max-w-4xl mx-auto px-4 py-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-black text-lg">
            Group {activeGroup}
            <span className="text-[#4A6B8A] text-sm font-normal ml-2">{groupPredicted}/6 picked</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {groupMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              prediction={predictions[match.id]}
              onPick={handlePick}
              locked={false}
               result={results?.[match.id]}
 
            />
          ))}
        </div>

        {/* Group navigation arrows */}
        <div className="flex justify-between mt-6 gap-3">
          {activeGroup !== "A" && (
            <button
              onClick={() => setActiveGroup(GROUPS[GROUPS.indexOf(activeGroup) - 1])}
              className="flex items-center gap-2 text-[#7BA3D4] hover:text-white text-sm font-medium transition-colors"
            >
              ← Group {GROUPS[GROUPS.indexOf(activeGroup) - 1]}
            </button>
          )}
          <div className="flex-1" />
          {activeGroup !== "L" && (
            <button
              onClick={() => setActiveGroup(GROUPS[GROUPS.indexOf(activeGroup) + 1])}
              className="flex items-center gap-2 text-[#7BA3D4] hover:text-white text-sm font-medium transition-colors"
            >
              Group {GROUPS[GROUPS.indexOf(activeGroup) + 1]} →
            </button>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#002657] border border-[#003F88] text-white text-sm font-medium px-5 py-3 rounded-xl shadow-2xl z-50 animate-bounce-in">
          {toast}
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <SubmitPreview
          player={player}
          predictions={predictions}
          onConfirm={handleConfirmSubmit}
          onBack={() => setShowPreview(false)}
          saving={saving}
        />
      )}
    </div>
  );
}
