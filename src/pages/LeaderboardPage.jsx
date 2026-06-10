import { useEffect, useState } from "react";
import { getAllPlayers, getResults } from "../utils/firebase";
import { buildLeaderboard } from "../utils/scoring";
import { GROUP_STAGE_MATCHES, getTeam } from "../data/matches";

const MEDAL = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage({ player, myPredictions, onBack }) {
  const [players, setPlayers] = useState({});
  const [results, setResults] = useState({});
  const [viewPlayer, setViewPlayer] = useState(null);
  const [tab, setTab] = useState("board");

  useEffect(() => {
    const unsubPlayers = getAllPlayers(setPlayers);
    const unsubResults = getResults(setResults);
    return () => {
      if (typeof unsubPlayers === "function") unsubPlayers();
      if (typeof unsubResults === "function") unsubResults();
    };
  }, []);

  const leaderboard = buildLeaderboard(players, results);
  const myRank = leaderboard.findIndex((p) => p.name === player.name) + 1;
  const myEntry = leaderboard.find((p) => p.name === player.name);
  const resultsCount = Object.keys(results).length;

  return (
    <div className="min-h-screen bg-[#001A3D]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#001A3D]/95 backdrop-blur border-b border-[#003F88]">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏆</span>
            <div>
              <h1 className="text-white font-black text-lg leading-tight">Leaderboard</h1>
              <p className="text-[#4A6B8A] text-[10px] uppercase tracking-wider">
                {resultsCount} of {GROUP_STAGE_MATCHES.length} results in
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{player.avatarFlag.flag}</span>
            <span className="text-[#7BA3D4] text-sm font-medium">{player.name}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-2xl mx-auto px-4 pb-3 flex gap-2">
          {["board", "mypicks", "knockout"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide transition-all ${
                tab === t ? "bg-[#FFD700] text-[#001A3D]" : "bg-[#002657] text-[#7BA3D4] hover:bg-[#003F88]"
              }`}
            >
              {t === "board" ? "🏆 Rankings" : t === "mypicks" ? "⚽ My Picks" : "🔜 Knockout"}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">
        {tab === "board" && (
          <>
            {/* My rank card */}
            {myEntry && (
              <div className="bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-2xl px-5 py-4 mb-5 flex items-center gap-4">
                <span className="text-4xl">{myRank <= 3 ? MEDAL[myRank - 1] : `#${myRank}`}</span>
                <div className="flex-1">
                  <p className="text-[#FFD700] font-black text-lg leading-tight">{player.name}</p>
                  <p className="text-[#7BA3D4] text-xs">Your current rank</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-black text-2xl">{myEntry.score}</p>
                  <p className="text-[#4A6B8A] text-[10px] uppercase">pts</p>
                </div>
              </div>
            )}

            {/* All players */}
            <div className="space-y-2">
              {leaderboard.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-5xl mb-3">⚽</p>
                  <p className="text-[#7BA3D4] font-medium">No predictions yet.</p>
                  <p className="text-[#4A6B8A] text-sm mt-1">Be the first to submit!</p>
                </div>
              ) : (
                leaderboard.map((p, i) => (
                  <button
                    key={p.name}
                    onClick={() => setViewPlayer(viewPlayer?.name === p.name ? null : p)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                      p.name === player.name
                        ? "border-[#FFD700]/40 bg-[#FFD700]/5"
                        : "border-[#003F88] bg-[#002657] hover:border-[#7BA3D4]"
                    }`}
                  >
                    <span className="text-xl w-7 text-center flex-shrink-0">
                      {i < 3 ? MEDAL[i] : <span className="text-[#4A6B8A] text-sm font-bold">#{i + 1}</span>}
                    </span>
                    <span className="text-2xl flex-shrink-0">{p.avatarFlag?.flag || "🏳️"}</span>
                    <span className="text-white font-bold flex-1 truncate">{p.name}</span>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[#FFD700] font-black text-lg leading-tight">{p.score}</p>
                      <p className="text-[#4A6B8A] text-[9px]">{p.correct}/{p.total} correct</p>
                    </div>
                    <span className="text-[#4A6B8A] text-xs ml-1">{viewPlayer?.name === p.name ? "▲" : "▼"}</span>
                  </button>
                ))
              )}
            </div>

            {/* Expanded predictions view */}
            {viewPlayer && (
              <PlayerPicksView player={viewPlayer} results={results} />
            )}
          </>
        )}

        {tab === "mypicks" && myEntry && (
          <PlayerPicksView player={myEntry} results={results} highlight />
        )}

        {tab === "knockout" && (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🔜</p>
            <h3 className="text-white font-black text-2xl mb-2">Knockout Stage</h3>
            <p className="text-[#7BA3D4] text-sm max-w-xs mx-auto">
              The knockout bracket opens once the group stage concludes and the Round of 32 teams are confirmed.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 max-w-xs mx-auto opacity-30">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-[#002657] border border-[#003F88] rounded-lg py-4 flex items-center justify-center">
                  <span className="text-[#4A6B8A] text-xs font-bold">TBD</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PlayerPicksView({ player, results, highlight }) {
  const { GROUP_STAGE_MATCHES, GROUPS, getTeam } = require("../data/matches");

  return (
    <div className={`mt-4 bg-[#002657] border border-[#003F88] rounded-2xl p-4 ${highlight ? "" : "mt-2"}`}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">{player.avatarFlag?.flag}</span>
        <span className="text-white font-black">{player.name}'s Picks</span>
        <span className="ml-auto text-[#FFD700] font-black">{player.score} pts</span>
      </div>
      {GROUPS.map((group) => {
        const gMatches = GROUP_STAGE_MATCHES.filter((m) => m.group === group);
        return (
          <div key={group} className="mb-3">
            <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-widest mb-1.5">Group {group}</p>
            {gMatches.map((match) => {
              const pred = player.predictions?.[match.id];
              const result = results[match.id];
              const home = getTeam(match.home);
              const away = getTeam(match.away);
              const isCorrect = result && pred === result;
              const isWrong = result && pred !== result;
              return (
                <div key={match.id} className="flex items-center gap-1.5 text-xs py-1 border-b border-[#003F88]/50 last:border-0">
                  <span>{home.flag}</span>
                  <span className="text-[#4A6B8A] flex-1 truncate">{home.code} v {away.code}</span>
                  <span>{away.flag}</span>
                  <span className="ml-2 text-[#7BA3D4] font-medium min-w-[48px] text-right">
                    {pred === "DRAW" ? "🤝 Draw" : pred ? `${getTeam(pred).flag} ${getTeam(pred).code}` : "—"}
                  </span>
                  {result && (
                    <span className={`ml-1 font-black ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                      {isCorrect ? "+2" : "0"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
