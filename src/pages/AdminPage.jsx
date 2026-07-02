import { useState, useEffect } from "react";
import { GROUP_STAGE_MATCHES, GROUPS, getTeam } from "../data/matches";
import { KNOCKOUT_MATCHES } from "../data/knockoutMatches";
import {
  setResult,
  getAllPlayers,
  getKnockoutUnlocked,
  setKnockoutUnlocked as fbSetKnockoutUnlocked,
  getKnockoutResults,
  setKnockoutResult,
  getKnockoutRoundLocks,
  setKnockoutRoundLock,
} from "../utils/firebase";
import { getDatabase, ref, update, get } from "firebase/database";
import FlagImg from "../components/FlagImg";
import { exportPredictions, exportKnockoutPredictions } from "../utils/exportExcel";

const ADMIN_PASSWORD = "wc2026admin";

const ROUND_LABELS = {
  R32: "Round of 32",
  R16: "Round of 16",
  QF: "Quarter Finals",
  SF: "Semi Finals",
  Bronze: "Bronze",
  Final: "Final",
};

const KNOCKOUT_ROUND_ORDER = ["R32", "R16", "QF", "SF", "Bronze", "Final"];

export default function AdminPage({ onExit, knockoutTeams = {} }) {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");

  const [results, setResults] = useState({});
  const [saved, setSaved] = useState({});
  const [activeGroup, setActiveGroup] = useState("A");

  const [knockoutUnlocked, setKnockoutUnlocked] = useState(false);
  const [knockoutResults, setKnockoutResultsState] = useState({});
  const [knockoutSaved, setKnockoutSaved] = useState({});
  const [activeKORound, setActiveKORound] = useState("R32");
  const [syncing, setSyncing] = useState(false);
  const [roundLocks, setRoundLocks] = useState({});

  const [players, setPlayers] = useState({});
  const [activeTab, setActiveTab] = useState("group");

  const handleLogin = () => {
    if (pw === ADMIN_PASSWORD) setAuthed(true);
    else alert("Wrong password");
  };

  useEffect(() => {
    if (!authed) return;
    const u1 = getAllPlayers(setPlayers);
    const u2 = getKnockoutUnlocked(setKnockoutUnlocked);
    const u3 = getKnockoutResults(setKnockoutResultsState);
    const u4 = getKnockoutRoundLocks(setRoundLocks);
    return () => {
      if (typeof u1 === "function") u1();
      if (typeof u2 === "function") u2();
      if (typeof u3 === "function") u3();
      if (typeof u4 === "function") u4();
    };
  }, [authed]);

  const handleSetResult = async (matchId, value) => {
    setResults((prev) => ({ ...prev, [matchId]: value }));
    try {
      await setResult(matchId, value);
      setSaved((prev) => ({ ...prev, [matchId]: true }));
      setTimeout(() => setSaved((prev) => ({ ...prev, [matchId]: false })), 1500);
    } catch (e) {
      alert("Failed to save result.");
    }
  };

  const handleToggleKnockout = async () => {
    const newVal = !knockoutUnlocked;
    setKnockoutUnlocked(newVal);
    await fbSetKnockoutUnlocked(newVal);
  };

  const handleToggleRoundLock = async (round) => {
    const newVal = !roundLocks[round];
    setRoundLocks(prev => ({ ...prev, [round]: newVal }));
    await setKnockoutRoundLock(round, newVal);
  };

  const handleSetKnockoutResult = async (matchId, winner) => {
    setKnockoutResultsState((prev) => ({ ...prev, [matchId]: { winner } }));
    try {
      await setKnockoutResult(matchId, winner);

      const db = getDatabase();
      const teamUpdates = {};
      teamUpdates[`W${matchId}`] = winner;

      if (matchId === "SF1" || matchId === "SF2") {
        const match = KNOCKOUT_MATCHES.find((m) => m.id === matchId);
        if (match) {
          const homeCode = knockoutTeams[match.h] || match.h;
          const awayCode = knockoutTeams[match.a] || match.a;
          const loser = winner === homeCode ? awayCode : homeCode;
          if (/^[A-Z]{3}$/.test(loser)) {
            teamUpdates[`L${matchId}`] = loser;
          }
        }
      }

      await update(ref(db, "knockoutTeams"), teamUpdates);

      setKnockoutSaved((prev) => ({ ...prev, [matchId]: true }));
      setTimeout(
        () => setKnockoutSaved((prev) => ({ ...prev, [matchId]: false })),
        1500
      );
    } catch (e) {
      alert("Failed to save knockout result.");
    }
  };

  const handleSyncKnockoutTeams = async () => {
    setSyncing(true);
    try {
      const db = getDatabase();
      const krSnap = await get(ref(db, "knockoutResults"));
      const existingResults = krSnap.exists() ? krSnap.val() : {};
      const ktSnap = await get(ref(db, "knockoutTeams"));
      const existingTeams = ktSnap.exists() ? ktSnap.val() : {};

      const updates = {};
      for (const match of KNOCKOUT_MATCHES) {
        const result = existingResults[match.id];
        if (!result?.winner) continue;
        const winner = result.winner;
        updates[`W${match.id}`] = winner;
        if (match.round === "SF") {
          const homeCode = existingTeams[match.h] || match.h;
          const awayCode = existingTeams[match.a] || match.a;
          const loser = winner === homeCode ? awayCode : homeCode;
          if (/^[A-Z]{3}$/.test(loser)) {
            updates[`L${match.id}`] = loser;
          }
        }
      }

      if (Object.keys(updates).length === 0) {
        alert("Nothing to sync — no knockout results found.");
        return;
      }

      await update(ref(db, "knockoutTeams"), updates);
      alert(`✅ Synced ${Object.keys(updates).length} knockout team slots!`);
    } catch (e) {
      alert("Sync failed: " + e.message);
    } finally {
      setSyncing(false);
    }
  };

  const knockoutSubmittedCount = Object.values(players).filter(
    (p) => p.knockoutPredictions && Object.keys(p.knockoutPredictions).length > 0
  ).length;

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#001A3D] flex items-center justify-center px-4">
        <div className="bg-[#002657] border border-[#003F88] rounded-2xl p-8 w-full max-w-sm">
          <h1 className="text-white font-black text-2xl mb-1">Admin Panel</h1>
          <p className="text-[#4A6B8A] text-sm mb-6">Enter admin password to update results</p>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Password"
            className="w-full bg-[#001A3D] border border-[#003F88] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFD700] mb-4"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-[#FFD700] text-[#001A3D] font-black py-3 rounded-xl hover:bg-[#FFC200] transition-all"
          >
            Enter
          </button>
          <button
            onClick={onExit}
            className="w-full mt-3 text-[#4A6B8A] hover:text-white text-sm transition-colors"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  const groupMatches = GROUP_STAGE_MATCHES.filter((m) => m.group === activeGroup);
  const koRoundMatches = KNOCKOUT_MATCHES.filter((m) => m.round === activeKORound);
  const groupResultsCount = Object.keys(results).length;
  const koResultsCount = Object.keys(knockoutResults).length;

  return (
    <div className="min-h-screen bg-[#001A3D]">
      <div className="sticky top-0 z-20 bg-[#001A3D]/95 backdrop-blur border-b border-[#003F88]">

        {/* Top bar */}
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <h1 className="text-white font-black text-xl">⚙️ Admin Panel</h1>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              onClick={handleSyncKnockoutTeams}
              disabled={syncing}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs px-3 py-2 rounded-lg transition-all"
            >
              {syncing ? "⏳ Syncing..." : "🔄 Sync KO Teams"}
            </button>
            <button
              onClick={() => exportPredictions(players)}
              disabled={Object.keys(players).length === 0}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs px-3 py-2 rounded-lg transition-all"
            >
              📥 Group ({Object.keys(players).length})
            </button>
            <button
              onClick={() => exportKnockoutPredictions(players, knockoutTeams)}
              disabled={knockoutSubmittedCount === 0}
              className="bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs px-3 py-2 rounded-lg transition-all"
            >
              📥 Knockout ({knockoutSubmittedCount})
            </button>
            <button
              onClick={onExit}
              className="text-[#4A6B8A] hover:text-white text-sm transition-colors"
            >
              ← Exit
            </button>
          </div>
        </div>

        {/* Knockout master unlock */}
        <div className="max-w-3xl mx-auto px-4 pb-3 flex items-center gap-3 flex-wrap">
          <span className="text-[#7BA3D4] text-xs font-bold uppercase tracking-wider">
            Knockout Stage:
          </span>
          <button
            onClick={handleToggleKnockout}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-black transition-all border ${
              knockoutUnlocked
                ? "bg-green-500/20 border-green-500 text-green-400 hover:bg-green-500/30"
                : "bg-[#002657] border-[#003F88] text-[#4A6B8A] hover:border-[#7BA3D4] hover:text-white"
            }`}
          >
            <span>{knockoutUnlocked ? "🔓" : "🔒"}</span>
            <span>{knockoutUnlocked ? "UNLOCKED — Click to lock" : "LOCKED — Click to unlock"}</span>
          </button>
          <span className="text-[#4A6B8A] text-[10px]">
            {knockoutUnlocked
              ? `Players can access knockout · ${knockoutSubmittedCount} submitted`
              : "Players cannot see knockout predictions"}
          </span>
        </div>

        {/* Per-round lock controls */}
        {knockoutUnlocked && (
          <div className="max-w-3xl mx-auto px-4 pb-3">
            <p className="text-[#7BA3D4] text-[10px] font-bold uppercase tracking-wider mb-2">
              Round Locks (🔒 = locked for players):
            </p>
            <div className="flex gap-2 flex-wrap">
              {KNOCKOUT_ROUND_ORDER.map(round => {
                const isLocked = roundLocks[round] || false;
                const rMatches = KNOCKOUT_MATCHES.filter(m => m.round === round);
                const hasTeams = rMatches.some(m => {
                  const h = knockoutTeams[m.h] || m.h;
                  const a = knockoutTeams[m.a] || m.a;
                  return /^[A-Z]{3}$/.test(h) && /^[A-Z]{3}$/.test(a);
                });
                return (
                  <button
                    key={round}
                    onClick={() => handleToggleRoundLock(round)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all border ${
                      isLocked
                        ? "bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30"
                        : hasTeams
                        ? "bg-green-500/20 border-green-500 text-green-400 hover:bg-green-500/30"
                        : "bg-[#002657] border-[#003F88] text-[#4A6B8A]"
                    }`}
                  >
                    {isLocked ? "🔒" : "🔓"} {ROUND_LABELS[round]}
                    {!hasTeams && <span className="text-[8px] text-[#4A6B8A] ml-1">(no teams)</span>}
                  </button>
                );
              })}
            </div>
            <p className="text-[#4A6B8A] text-[9px] mt-2">
              🔴 Red = locked (players can't predict) · 🟢 Green = open (players can predict) · Lock a round after matches are played
            </p>
          </div>
        )}

        {/* Tab switcher */}
        <div className="max-w-3xl mx-auto px-4 pb-3 flex gap-2">
          <button
            onClick={() => setActiveTab("group")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide transition-all ${
              activeTab === "group" ? "bg-[#FFD700] text-[#001A3D]" : "bg-[#002657] text-[#7BA3D4] hover:bg-[#003F88]"
            }`}
          >
            ⚽ Group Stage
            {groupResultsCount > 0 && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${
                activeTab === "group" ? "bg-[#001A3D]/20 text-[#001A3D]" : "bg-green-500/20 text-green-400"
              }`}>
                {groupResultsCount}/72
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("knockout")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide transition-all ${
              activeTab === "knockout" ? "bg-[#FFD700] text-[#001A3D]" : "bg-[#002657] text-[#7BA3D4] hover:bg-[#003F88]"
            }`}
          >
            🏆 Knockout
            {koResultsCount > 0 && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${
                activeTab === "knockout" ? "bg-[#001A3D]/20 text-[#001A3D]" : "bg-green-500/20 text-green-400"
              }`}>
                {koResultsCount}/31
              </span>
            )}
          </button>
        </div>

        {/* Group tabs */}
        {activeTab === "group" && (
          <div className="max-w-3xl mx-auto px-4 pb-3 flex gap-1.5 overflow-x-auto scrollbar-none">
            {GROUPS.map((g) => {
              const gMatches = GROUP_STAGE_MATCHES.filter((m) => m.group === g);
              const gDone = gMatches.filter((m) => results[m.id]).length;
              const gComplete = gDone === gMatches.length;
              return (
                <button
                  key={g}
                  onClick={() => setActiveGroup(g)}
                  className={`relative flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    activeGroup === g ? "bg-[#FFD700] text-[#001A3D]" : "bg-[#002657] text-[#7BA3D4] hover:bg-[#003F88]"
                  }`}
                >
                  Group {g}
                  {gComplete && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full" />}
                  {!gComplete && gDone > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Knockout round tabs */}
        {activeTab === "knockout" && (
          <div className="max-w-3xl mx-auto px-4 pb-3 flex gap-1.5 overflow-x-auto scrollbar-none">
            {KNOCKOUT_ROUND_ORDER.map((r) => {
              const rMatches = KNOCKOUT_MATCHES.filter((m) => m.round === r);
              const rDone = rMatches.filter((m) => knockoutResults[m.id]?.winner).length;
              const rComplete = rDone === rMatches.length && rMatches.length > 0;
              return (
                <button
                  key={r}
                  onClick={() => setActiveKORound(r)}
                  className={`relative flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    activeKORound === r ? "bg-[#FFD700] text-[#001A3D]" : "bg-[#002657] text-[#7BA3D4] hover:bg-[#003F88]"
                  }`}
                >
                  {ROUND_LABELS[r]}
                  {rComplete && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full" />}
                  {!rComplete && rDone > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="max-w-3xl mx-auto px-4 py-5">

        {/* ── GROUP STAGE TAB ── */}
        {activeTab === "group" && (
          <>
            <p className="text-[#4A6B8A] text-xs mb-4">
              Click the winning team or Draw for each match. Results save instantly to Firebase.
            </p>
            <div className="space-y-3">
              {groupMatches.map((match) => {
                const home = getTeam(match.home);
                const away = getTeam(match.away);
                const currentResult = results[match.id];
                const options = [
                  { value: match.home, label: home.code, iso: home.iso },
                  { value: "DRAW", label: "Draw", iso: null },
                  { value: match.away, label: away.code, iso: away.iso },
                ];
                return (
                  <div
                    key={match.id}
                    className={`bg-[#002657] border rounded-xl px-4 py-3 transition-all ${
                      currentResult ? "border-green-500/30" : "border-[#003F88]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <FlagImg iso={home.iso} size={20} className="rounded-sm" />
                        <span className="text-white text-sm font-bold">{home.name}</span>
                        <span className="text-[#4A6B8A] text-xs font-black">vs</span>
                        <span className="text-white text-sm font-bold">{away.name}</span>
                        <FlagImg iso={away.iso} size={20} className="rounded-sm" />
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {currentResult && (
                          <span className="text-green-400 text-[9px] font-black bg-green-500/10 px-1.5 py-0.5 rounded">
                            SAVED ✓
                          </span>
                        )}
                        <span className="text-[#4A6B8A] text-[10px]">{match.date}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {options.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleSetResult(match.id, opt.value)}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                            currentResult === opt.value
                              ? "bg-green-500/20 border border-green-500 text-green-400"
                              : "bg-[#001A3D] border border-[#003F88] text-[#7BA3D4] hover:border-[#7BA3D4] hover:text-white"
                          }`}
                        >
                          {opt.iso ? (
                            <><FlagImg iso={opt.iso} size={16} className="rounded-sm" />{opt.label}</>
                          ) : (
                            <span>🤝 {opt.label}</span>
                          )}
                          {saved[match.id] && currentResult === opt.value && <span className="ml-1">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── KNOCKOUT TAB ── */}
        {activeTab === "knockout" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[#4A6B8A] text-xs">
                Click the winning team for each knockout match. No draws in knockout.
              </p>
              {!knockoutUnlocked && (
                <span className="text-yellow-400 text-[10px] font-bold bg-yellow-400/10 border border-yellow-400/20 px-2 py-1 rounded-lg flex-shrink-0 ml-2">
                  ⚠️ Predictions locked
                </span>
              )}
            </div>

            <div className="mb-4 bg-purple-500/10 border border-purple-500/20 rounded-xl px-4 py-3">
              <p className="text-purple-300 text-xs font-medium">
                💡 After entering R32 results, click <strong>🔄 Sync KO Teams</strong> to fill R16 bracket slots. Then unlock R16 for player predictions.
              </p>
            </div>

            {/* Round progress */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              {KNOCKOUT_ROUND_ORDER.map((r) => {
                const rMatches = KNOCKOUT_MATCHES.filter((m) => m.round === r);
                const rDone = rMatches.filter((m) => knockoutResults[m.id]?.winner).length;
                const isLocked = roundLocks[r] || false;
                return (
                  <button
                    key={r}
                    onClick={() => setActiveKORound(r)}
                    className={`px-3 py-2 rounded-lg border text-center transition-all ${
                      activeKORound === r
                        ? "border-[#FFD700] bg-[#FFD700]/10"
                        : "border-[#003F88] bg-[#002657] hover:border-[#7BA3D4]"
                    }`}
                  >
                    <p className={`text-[10px] font-black ${activeKORound === r ? "text-[#FFD700]" : "text-[#7BA3D4]"}`}>
                      {ROUND_LABELS[r]} {isLocked ? "🔒" : "🔓"}
                    </p>
                    <p className="text-[9px] text-[#4A6B8A] mt-0.5">{rDone}/{rMatches.length} done</p>
                  </button>
                );
              })}
            </div>

            <div className="space-y-3">
              {koRoundMatches.map((match) => {
                const homeCode = /^[A-Z]{3}$/.test(match.h) ? match.h : knockoutTeams[match.h] || match.h;
                const awayCode = /^[A-Z]{3}$/.test(match.a) ? match.a : knockoutTeams[match.a] || match.a;
                const homeKnown = /^[A-Z]{3}$/.test(homeCode);
                const awayKnown = /^[A-Z]{3}$/.test(awayCode);
                const home = homeKnown ? getTeam(homeCode) : null;
                const away = awayKnown ? getTeam(awayCode) : null;
                const currentWinner = knockoutResults[match.id]?.winner;

                return (
                  <div
                    key={match.id}
                    className={`bg-[#002657] border rounded-xl px-4 py-3 transition-all ${
                      currentWinner ? "border-green-500/30" : "border-[#003F88]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {home ? (
                          <><FlagImg iso={home.iso} size={20} className="rounded-sm" /><span className="text-white text-sm font-bold">{home.name}</span></>
                        ) : (
                          <span className="text-[#4A6B8A] text-sm font-bold italic">{match.h}</span>
                        )}
                        <span className="text-[#4A6B8A] text-xs font-black">vs</span>
                        {away ? (
                          <><span className="text-white text-sm font-bold">{away.name}</span><FlagImg iso={away.iso} size={20} className="rounded-sm" /></>
                        ) : (
                          <span className="text-[#4A6B8A] text-sm font-bold italic">{match.a}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {currentWinner && (
                          <span className="text-green-400 text-[9px] font-black bg-green-500/10 px-1.5 py-0.5 rounded">SAVED ✓</span>
                        )}
                        <span className="text-[#4A6B8A] text-[10px]">{match.date}</span>
                      </div>
                    </div>

                    {home && away ? (
                      <div className="flex gap-2">
                        {[home, away].map((team) => (
                          <button
                            key={team.code}
                            onClick={() => handleSetKnockoutResult(match.id, team.code)}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                              currentWinner === team.code
                                ? "bg-green-500/20 border border-green-500 text-green-400"
                                : "bg-[#001A3D] border border-[#003F88] text-[#7BA3D4] hover:border-[#7BA3D4] hover:text-white"
                            }`}
                          >
                            <FlagImg iso={team.iso} size={16} className="rounded-sm" />
                            {team.code}
                            {knockoutSaved[match.id] && currentWinner === team.code && <span className="ml-1">✓</span>}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-[#001535] border border-[#0F3060] border-dashed rounded-lg px-3 py-2.5 text-center">
                        <p className="text-[#4A6B8A] text-xs">⏳ Teams not yet determined</p>
                        <p className="text-[#4A6B8A] text-[10px] mt-0.5">
                          {!homeKnown && <span>Waiting for <span className="text-white font-bold">{match.h}</span> </span>}
                          {!homeKnown && !awayKnown && "& "}
                          {!awayKnown && <span>Waiting for <span className="text-white font-bold">{match.a}</span></span>}
                        </p>
                      </div>
                    )}

                    {currentWinner && (
                      <div className="mt-2 flex items-center gap-2 px-1">
                        <span className="text-[#4A6B8A] text-[10px]">Winner:</span>
                        <FlagImg iso={getTeam(currentWinner).iso} size={14} className="rounded-sm" />
                        <span className="text-green-400 text-[10px] font-bold">{getTeam(currentWinner).name}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}