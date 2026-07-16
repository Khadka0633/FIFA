import { useState, useEffect } from "react";
import { KNOCKOUT_MATCHES } from "../data/KnockoutMatches";
import FlagImg from "../components/FlagImg";
import KnockoutPredictCard from "../components/KnockoutPredictCard";
import { getKnockoutResults, getKnockoutRoundLocks, saveKnockoutRoundPredictions } from "../utils/firebase";

export default function KnockoutPredictPage({ player, knockoutTeams = {}, onSubmitted, existingPredictions, onBack }) {
  const [predictions, setPredictions] = useState(existingPredictions || {});
  const [saving, setSaving] = useState(null); // matchId being saved
  const [toast, setToast] = useState("");
  const [results, setResults] = useState({});
  const [roundLocks, setRoundLocks] = useState({});

  useEffect(() => {
    const u1 = getKnockoutResults(setResults);
    const u2 = getKnockoutRoundLocks(setRoundLocks);
    return () => {
      if (typeof u1 === "function") u1();
      if (typeof u2 === "function") u2();
    };
  }, []);

  // Hide R32 entirely — only show R16 and beyond
  const VISIBLE_ROUNDS = ["R16", "QF", "SF","Bronze", "Final"];
  const roundLabels = {
    R16: "Round of 16",
    QF: "Quarter Finals",
    SF: "Semi Finals",
    Bronze: "3rd Place",
    Final: "Final",
  };

  // Only show rounds that admin hasn't fully locked
  const availableRounds = VISIBLE_ROUNDS.filter(r => !roundLocks[r]);

  const [activeRound, setActiveRound] = useState(() => {
    return VISIBLE_ROUNDS.find(r => !roundLocks[r]) || "R16";
  });

  // Keep activeRound valid when locks change
  useEffect(() => {
    if (roundLocks[activeRound]) {
      const next = VISIBLE_ROUNDS.find(r => !roundLocks[r]);
      if (next) setActiveRound(next);
    }
  }, [roundLocks]);

  const roundMatches = KNOCKOUT_MATCHES.filter(m => m.round === activeRound);

  const resolveTeamCode = (slot) => {
    if (/^[A-Z]{3}$/.test(slot)) return slot;
    return knockoutTeams?.[slot] || slot;
  };

  const isMatchKnown = (match) => {
    const h = resolveTeamCode(match.h);
    const a = resolveTeamCode(match.a);
    return /^[A-Z]{3}$/.test(h) && /^[A-Z]{3}$/.test(a);
  };

  // A match is "player-locked" once they've saved a pick for it
  const isMatchSaved = (matchId) => {
    return !!existingPredictions?.[matchId];
  };

  // Admin locked the whole round
  const isRoundAdminLocked = (round) => roundLocks[round] || false;

  // Count stats
  const visibleMatches = KNOCKOUT_MATCHES.filter(m => VISIBLE_ROUNDS.includes(m.round));
  const predictableMatches = visibleMatches.filter(m => isMatchKnown(m) && !isRoundAdminLocked(m.round));
  const predictedCount = predictableMatches.filter(m => predictions[m.id]).length;

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // Save a single match pick
  const handlePick = async (matchId, teamCode) => {
    const match = KNOCKOUT_MATCHES.find(m => m.id === matchId);
    if (!match) return;
    if (isRoundAdminLocked(match.round)) return;
    if (isMatchSaved(matchId)) return; // already locked

    // Update local state immediately
    const newPredictions = { ...predictions, [matchId]: teamCode };
    setPredictions(newPredictions);

    // Save to Firebase immediately on pick
    setSaving(matchId);
    try {
      await saveKnockoutRoundPredictions(
        player.name,
        match.round,
        { [matchId]: teamCode },
        player.avatarFlag
      );
      onSubmitted(newPredictions, match.round);
      showToast(`✅ Pick saved!`);
    } catch (e) {
      showToast("❌ Failed to save. Try again.");
      // Revert on failure
      setPredictions(predictions);
    }
    setSaving(null);
  };

  if (availableRounds.length === 0) {
    return (
      <div className="min-h-screen bg-[#001A3D] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-6xl mb-4">🔒</p>
          <h2 className="text-white font-black text-2xl mb-2">All Rounds Locked</h2>
          <p className="text-[#7BA3D4] text-sm mb-6">No rounds are currently open for predictions.</p>
          <button
            onClick={onBack}
            className="bg-[#FFD700] hover:bg-[#FFC200] text-[#001A3D] font-black px-6 py-3 rounded-xl transition-all"
          >
            ← Back to Leaderboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#001A3D]">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#001A3D]/95 backdrop-blur border-b border-[#003F88]">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={onBack}
              className="text-[#4A6B8A] hover:text-white text-sm transition-colors flex-shrink-0 mr-1"
            >
              ← Back
            </button>
            <FlagImg iso={player?.avatarFlag?.iso} size={28} className="rounded-sm flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-white font-black text-sm truncate leading-tight">{player?.name}</p>
              <p className="text-[#4A6B8A] text-[10px] uppercase tracking-wider">Knockout Predictions</p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[#FFD700] text-xs font-bold">{predictedCount}/{predictableMatches.length}</p>
            <p className="text-[#4A6B8A] text-[9px] uppercase">picked</p>
          </div>
        </div>

        {/* Round tabs — R32 hidden, only R16+ */}
        <div className="max-w-4xl mx-auto px-4 pb-3 flex gap-1.5 overflow-x-auto scrollbar-none">
          {availableRounds.map(r => {
            const rMatches = KNOCKOUT_MATCHES.filter(m => m.round === r);
            const knownCount = rMatches.filter(m => isMatchKnown(m)).length;
            const savedCount = rMatches.filter(m => predictions[m.id]).length;
            const allSaved = knownCount > 0 && savedCount === knownCount;

            return (
              <button
                key={r}
                onClick={() => setActiveRound(r)}
                className={`relative flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                  activeRound === r
                    ? "bg-[#FFD700] text-[#001A3D]"
                    : "bg-[#002657] text-[#7BA3D4] hover:bg-[#003F88]"
                }`}
              >
                {roundLabels[r]}
                {allSaved && <span className="absolute -top-1 -right-1 text-[8px]">✅</span>}
                {!allSaved && knownCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Matches */}
      <div className="max-w-4xl mx-auto px-4 py-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-black text-lg">{roundLabels[activeRound]}</h2>
          {isRoundAdminLocked(activeRound) && (
            <span className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold px-3 py-1.5 rounded-lg">
              🔒 Round Locked by Admin
            </span>
          )}
        </div>

        <p className="text-[#4A6B8A] text-xs mb-4">
          💡 Your pick is saved instantly when you click a team. Once saved, a pick cannot be changed.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {roundMatches.map(match => {
            const matchKnown = isMatchKnown(match);
            const matchSaved = isMatchSaved(match.id);
            const isSavingThis = saving === match.id;

            return (
              <MatchPickCard
                key={match.id}
                match={match}
                round={activeRound}
                knockoutTeams={knockoutTeams}
                prediction={predictions[match.id]}
                onPick={handlePick}
                locked={matchSaved || isRoundAdminLocked(activeRound) || isSavingThis}
                saving={isSavingThis}
                result={results[match.id]}
                matchKnown={matchKnown}
              />
            );
          })}
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

// ── Per-match pick card ───────────────────────────────────────────────────────
function MatchPickCard({ match, round, knockoutTeams, prediction, onPick, locked, saving, result, matchKnown }) {
  const resolveTeam = (slot) => {
    const code = /^[A-Z]{3}$/.test(slot) ? slot : knockoutTeams?.[slot] || slot;
    if (!/^[A-Z]{3}$/.test(code)) return null;
    // inline getTeam logic using import
    return code;
  };

  const homeCode = resolveTeam(match.h);
  const awayCode = resolveTeam(match.a);

  return (
    <KnockoutPredictCard
      match={match}
      round={round}
      knockoutTeams={knockoutTeams}
      prediction={prediction}
      onPick={locked ? () => {} : onPick}
      locked={locked}
      result={result}
      saving={saving}
    />
  );
}