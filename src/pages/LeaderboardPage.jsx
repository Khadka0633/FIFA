import { useEffect, useState, useRef } from "react";
import { getAllPlayers, getResults, sendChatMessage, getChat, getKnockoutResults, getKnockoutUnlocked, getKnockoutTeams } from "../utils/firebase";
import { buildLeaderboard } from "../utils/scoring";
import { GROUP_STAGE_MATCHES, getTeam, GROUPS } from "../data/matches";
import { KNOCKOUT_MATCHES } from "../data/KnockoutMatches";
import FlagImg from "../components/FlagImg";
import { buildKnockoutLeaderboard } from "../utils/KnockoutScoring";
import KnockoutBracket from "../components/KnockoutBracket";


const MEDAL = ["🥇", "🥈", "🥉"];

const ROUND_LABELS = {
  R32: "Round of 32",
  R16: "Round of 16",
  QF: "Quarter Finals",
  SF: "Semi Finals",
  Bronze: "Bronze",
  Final: "Final",
};

export default function LeaderboardPage({ player, myPredictions, onBack, onGoKnockout }) {
  const [players, setPlayers] = useState({});
  const [results, setResults] = useState({});
  const [viewPlayer, setViewPlayer] = useState(null);
  const [knockoutResults, setKnockoutResults] = useState({});
  const [knockoutUnlocked, setKnockoutUnlocked] = useState(false);
  const [knockoutTeams, setKnockoutTeams] = useState({});
  const [tab, setTab] = useState("knockout");

  useEffect(() => {
    const unsubPlayers = getAllPlayers(setPlayers);
    const unsubResults = getResults(setResults);
    const unsubKOR = getKnockoutResults(setKnockoutResults);
    const unsubKOU = getKnockoutUnlocked(setKnockoutUnlocked);
    const unsubKT = getKnockoutTeams(setKnockoutTeams);
    return () => {
      if (typeof unsubPlayers === "function") unsubPlayers();
      if (typeof unsubResults === "function") unsubResults();
      if (typeof unsubKOR === "function") unsubKOR();
      if (typeof unsubKOU === "function") unsubKOU();
      if (typeof unsubKT === "function") unsubKT();
    };
  }, []);

  const leaderboard = buildLeaderboard(players, results).filter(p => p?.name && p?.avatarFlag);
  const myRank = leaderboard.findIndex((p) => p.name === player?.name) + 1;
  const myEntry = leaderboard.find((p) => p.name === player?.name);
  const resultsCount = Object.keys(results).length;
  const knockoutLeaderboard = buildKnockoutLeaderboard(players, knockoutResults).filter(p => p?.name && p?.avatarFlag);
  const myKOEntry = knockoutLeaderboard.find((p) => p.name === player?.name);
  const myKORank = knockoutLeaderboard.findIndex((p) => p.name === player?.name) + 1;

  const isGuest = player?.name === "Guest";

  const handleTabClick = (t) => {
   
    setTab(t);
  };

  const TABS = [ "mypicks", "bracket", "knockout"];

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
            <FlagImg iso={player?.avatarFlag?.iso} size={24} className="rounded-sm" />
            <span className="text-[#7BA3D4] text-sm font-medium">{player?.name}</span>
          </div>
          <button onClick={onBack} className="text-[#4A6B8A] hover:text-white text-sm transition-colors">
            ← Back
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-2xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-none">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => handleTabClick(t)}
              className={`relative flex-shrink-0 px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide transition-all ${
                tab === t ? "bg-[#FFD700] text-[#001A3D]" : "bg-[#002657] text-[#7BA3D4] hover:bg-[#003F88]"
              }`}
            >
              {t === "board" ? "🏆 Rankings"
                : t === "chat" ? "💬 Chat"
                : t === "mypicks" ? "⚽ My Picks"
                : t === "fixtures" ? "📅 Fixtures"
                : t === "bracket" ? "🗂️ Bracket"
                : knockoutUnlocked ? "🏆 Knockout" : "🔜 Knockout"}
              {t === "knockout" && knockoutUnlocked  && !isGuest && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ── */}

      {/* Rankings — full width, no max-w constraint so it breathes */}
      {tab === "board" && (
        <div className="max-w-2xl mx-auto px-4 py-5">
          {myEntry && (
            <div className="bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-2xl px-5 py-4 mb-5 flex items-center gap-4">
              <span className="text-4xl">{myRank <= 3 ? MEDAL[myRank - 1] : `#${myRank}`}</span>
              <div className="flex-1">
                <p className="text-[#FFD700] font-black text-lg leading-tight">{player?.name}</p>
                <p className="text-[#7BA3D4] text-xs">Your current rank</p>
              </div>
              <div className="text-right">
                <p className="text-white font-black text-2xl">{myEntry.score}</p>
                <p className="text-[#4A6B8A] text-[10px] uppercase">{myEntry.correct}/{myEntry.total} correct</p>
              </div>
            </div>
          )}
          {resultsCount > 0 && (
            <div className="mb-4 bg-[#002657] border border-[#003F88] rounded-xl px-4 py-3">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[#7BA3D4]">Tournament progress</span>
                <span className="text-[#FFD700] font-bold">{resultsCount}/{GROUP_STAGE_MATCHES.length} matches played</span>
              </div>
              <div className="h-1.5 bg-[#001A3D] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FFD700] rounded-full transition-all duration-500"
                  style={{ width: `${(resultsCount / GROUP_STAGE_MATCHES.length) * 100}%` }}
                />
              </div>
            </div>
          )}
          <div className="space-y-2">
            {leaderboard.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-5xl mb-3">⚽</p>
                <p className="text-[#7BA3D4] font-medium">No predictions yet.</p>
                <p className="text-[#4A6B8A] text-sm mt-1">Be the first to submit!</p>
              </div>
            ) : (
              leaderboard.map((p, i) => (
                <div key={p.name}>
                  <button
                    onClick={() => setViewPlayer(viewPlayer?.name === p.name ? null : p)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                      p.name === player?.name
                        ? "border-[#FFD700]/40 bg-[#FFD700]/5"
                        : "border-[#003F88] bg-[#002657] hover:border-[#7BA3D4]"
                    }`}
                  >
                    <span className="text-xl w-7 text-center flex-shrink-0">
                      {i < 3 ? MEDAL[i] : <span className="text-[#4A6B8A] text-sm font-bold">#{i + 1}</span>}
                    </span>
                    <FlagImg iso={p.avatarFlag?.iso} size={24} className="rounded-sm flex-shrink-0" />
                    <span className="text-white font-bold flex-1 truncate">{p.name}</span>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[#FFD700] font-black text-lg leading-tight">{p.score} pts</p>
                      <p className="text-[#4A6B8A] text-[9px]">{p.correct}/{p.total} correct</p>
                    </div>
                    <span className="text-[#4A6B8A] text-xs ml-1">{viewPlayer?.name === p.name ? "▲" : "▼"}</span>
                  </button>
                  {viewPlayer?.name === p.name && (
                    <GroupPicksView player={viewPlayer} results={results} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Chat */}
      {tab === "chat" && (
        <div className="max-w-2xl mx-auto px-4 py-5">
          <ChatTab player={player} myEntry={myEntry} />
        </div>
      )}

      {/* My Picks */}
      {tab === "mypicks" && (
        <div className="max-w-2xl mx-auto px-4 py-5">
          {myEntry ? (
            <PlayerPicksView
              player={myEntry}
              results={results}
              knockoutResults={knockoutResults}
              knockoutTeams={knockoutTeams}
              highlight
            />
          ) : (
            <div className="text-center py-16">
              <p className="text-5xl mb-3">⚽</p>
              <p className="text-[#7BA3D4] font-medium">No predictions found.</p>
              <p className="text-[#4A6B8A] text-sm mt-1">Submit your picks first!</p>
            </div>
          )}
        </div>
      )}

      {/* Fixtures */}
      {tab === "fixtures" && (
        <div className="max-w-2xl mx-auto px-4 py-5">
          <FixturesTab results={results} />
        </div>
      )}

      {/* Bracket — wider container, no max-w cap so bracket can scroll */}
      {tab === "bracket" && (
        <div className="px-4 py-5">
          {knockoutUnlocked ? (
            <KnockoutBracket
              knockoutResults={knockoutResults}
              knockoutTeams={knockoutTeams}
            />
          ) : (
            <div className="text-center py-20">
              <p className="text-6xl mb-4">🔒</p>
              <h3 className="text-white font-black text-2xl mb-2">Bracket Not Yet Available</h3>
              <p className="text-[#7BA3D4] text-sm max-w-xs mx-auto">
                The knockout stage hasn't been unlocked yet. Check back soon!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Knockout Leaderboard */}
      {tab === "knockout" && (
        <div className="max-w-2xl mx-auto px-4 py-5">
          <KnockoutLeaderboardTab
            leaderboard={knockoutLeaderboard}
            player={player}
            myEntry={myKOEntry}
            myRank={myKORank}
            knockoutResults={knockoutResults}
            knockoutUnlocked={knockoutUnlocked}
            knockoutTeams={knockoutTeams}
            onGoKnockout={!isGuest ? onGoKnockout : null}
          />
        </div>
      )}
    </div>
  );
}

// ── Chat Tab ──────────────────────────────────────────────────────────────────
function ChatTab({ player, myEntry }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    const unsub = getChat(setMessages);
    return () => { if (typeof unsub === "function") unsub(); };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || sending) return;
    setSending(true);
    await sendChatMessage(player.name, player.avatarFlag, msg);
    setInput("");
    setSending(false);
  };

  const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const canChat = !!myEntry;

  return (
    <div className="flex flex-col h-[70vh]">
      <div className="mb-3">
        <h2 className="text-white font-black text-lg">💬 Global Chat</h2>
        <p className="text-[#4A6B8A] text-[10px]">Trash talk, predictions, celebrations — all welcome</p>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-3">
        {messages.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">💬</p>
            <p className="text-[#7BA3D4] font-medium">No messages yet.</p>
            <p className="text-[#4A6B8A] text-sm mt-1">Be the first to say something!</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.name === player.name;
            return (
              <div key={i} className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                <FlagImg iso={msg.avatarFlag?.iso} size={24} className="rounded-sm flex-shrink-0 mb-0.5" />
                <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                  <span className={`text-[9px] text-[#4A6B8A] font-medium px-1 ${isMe ? "text-right" : "text-left"}`}>
                    {msg.name} · {formatTime(msg.timestamp)}
                  </span>
                  <div className={`px-3 py-2 rounded-2xl text-sm leading-snug ${
                    isMe ? "bg-[#FFD700] text-[#001A3D] font-semibold rounded-br-sm"
                      : "bg-[#002657] border border-[#003F88] text-white rounded-bl-sm"
                  }`}>
                    {msg.message}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
      {canChat ? (
        <div className="flex gap-2 items-center">
          <FlagImg iso={player.avatarFlag?.iso} size={28} className="rounded-sm flex-shrink-0" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            maxLength={200}
            className="flex-1 bg-[#002657] border border-[#003F88] rounded-xl px-4 py-2.5 text-white placeholder-[#4A6B8A] focus:outline-none focus:border-[#FFD700] text-sm transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="bg-[#FFD700] hover:bg-[#FFC200] disabled:opacity-40 disabled:cursor-not-allowed text-[#001A3D] font-black px-4 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95"
          >
            {sending ? "⏳" : "Send →"}
          </button>
        </div>
      ) : (
        <div className="bg-[#002657] border border-[#003F88] rounded-xl px-4 py-3 text-center">
          <p className="text-[#7BA3D4] text-sm">🔒 Submit your predictions to join the chat</p>
        </div>
      )}
    </div>
  );
}

// ── Group Picks View (Rankings expand) ───────────────────────────────────────
function GroupPicksView({ player, results }) {
  return (
    <div className="bg-[#002657] border border-[#003F88] rounded-2xl p-4 mt-2">
      <div className="flex items-center gap-2 mb-4">
        <FlagImg iso={player?.avatarFlag?.iso} size={28} className="rounded-sm" />
        <span className="text-white font-black">{player.name}'s Picks</span>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-[#7BA3D4] text-xs">{player.correct}/{player.total} correct</span>
          <span className="text-[#FFD700] font-black">{player.score} pts</span>
        </div>
      </div>
      {GROUPS.map((group) => {
        const gMatches = GROUP_STAGE_MATCHES.filter((m) => m.group === group);
        return (
          <div key={group} className="mb-3">
            <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-widest mb-1.5">Group {group}</p>
            {gMatches.map((match) => {
              const pred = player.predictions?.[match.id];
              const resultRaw = results[match.id];
              const winner = resultRaw ? (typeof resultRaw === "object" ? resultRaw.winner : resultRaw) : null;
              const home = getTeam(match.home);
              const away = getTeam(match.away);
              const isCorrect = winner && pred === winner;
              return (
                <div key={match.id} className="flex items-center text-xs py-1.5 border-b border-[#003F88]/50 last:border-0 gap-1.5">
                  <FlagImg iso={home.iso} size={16} className="rounded-sm flex-shrink-0" />
                  <span className="text-[#4A6B8A] flex-shrink-0">{home.code} v {away.code}</span>
                  <FlagImg iso={away.iso} size={16} className="rounded-sm flex-shrink-0" />
                  <span className="flex-1" />
                  {pred === "DRAW" ? (
                    <span className="text-[#7BA3D4] flex-shrink-0">🤝 Draw</span>
                  ) : pred ? (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <FlagImg iso={getTeam(pred)?.iso} size={16} className="rounded-sm" />
                      <span className="text-[#7BA3D4] font-medium">{getTeam(pred)?.code}</span>
                    </div>
                  ) : (
                    <span className="text-[#4A6B8A] flex-shrink-0">—</span>
                  )}
                  {winner && (
                    <span className={`font-black w-6 text-right flex-shrink-0 ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                      {isCorrect ? "+2" : "✗"}
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

// ── My Picks View (group + knockout) ─────────────────────────────────────────
function PlayerPicksView({ player, results, knockoutResults, knockoutTeams = {}, highlight }) {
  if (!player) return null;
  const totalResults = Object.keys(results).length;
  const hasKOPredictions = player.knockoutPredictions && Object.keys(player.knockoutPredictions).length > 0;

  return (
    <div className={`bg-[#002657] border border-[#003F88] rounded-2xl p-4 ${highlight ? "mt-0" : "mt-2"}`}>
      <div className="flex items-center gap-2 mb-4">
        <FlagImg iso={player?.avatarFlag?.iso} size={28} className="rounded-sm" />
        <span className="text-white font-black">{player.name}'s Picks</span>
        <div className="ml-auto flex items-center gap-3">
          {totalResults > 0 && (
            <span className="text-[#7BA3D4] text-xs">{player.correct}/{player.total} correct</span>
          )}
          <span className="text-[#FFD700] font-black">{player.score} pts</span>
        </div>
      </div>

      {/* Group Stage */}
      {GROUPS.map((group) => {
        const gMatches = GROUP_STAGE_MATCHES.filter((m) => m.group === group);
        return (
          <div key={group} className="mb-3">
            <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-widest mb-1.5">Group {group}</p>
            {gMatches.map((match) => {
              const pred = player.predictions?.[match.id];
              const resultRaw = results[match.id];
              const winner = resultRaw ? (typeof resultRaw === "object" ? resultRaw.winner : resultRaw) : null;
              const home = getTeam(match.home);
              const away = getTeam(match.away);
              const isCorrect = winner && pred === winner;
              return (
                <div key={match.id} className="flex items-center text-xs py-1.5 border-b border-[#003F88]/50 last:border-0 gap-1.5">
                  <FlagImg iso={home.iso} size={16} className="rounded-sm flex-shrink-0" />
                  <span className="text-[#4A6B8A] flex-shrink-0">{home.code} v {away.code}</span>
                  <FlagImg iso={away.iso} size={16} className="rounded-sm flex-shrink-0" />
                  <span className="flex-1" />
                  {pred === "DRAW" ? (
                    <span className="text-[#7BA3D4] flex-shrink-0">🤝 Draw</span>
                  ) : pred ? (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <FlagImg iso={getTeam(pred)?.iso} size={16} className="rounded-sm" />
                      <span className="text-[#7BA3D4] font-medium">{getTeam(pred)?.code}</span>
                    </div>
                  ) : (
                    <span className="text-[#4A6B8A] flex-shrink-0">—</span>
                  )}
                  {winner && (
                    <span className={`font-black w-6 text-right flex-shrink-0 ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                      {isCorrect ? "+2" : "✗"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}

      {/* Knockout Picks */}
      {hasKOPredictions && (
        <div className="mt-4 border-t border-[#003F88]/50 pt-4">
          <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-widest mb-3">🏆 Knockout Picks</p>
          <KnockoutPicksRows
            predictions={player.knockoutPredictions}
            knockoutResults={knockoutResults}
            knockoutTeams={knockoutTeams}
          />
        </div>
      )}
    </div>
  );
}

// ── Shared Knockout Picks Rows ────────────────────────────────────────────────
function KnockoutPicksRows({ predictions, knockoutResults, knockoutTeams = {} }) {
  return (
    <>
      {["R32", "R16", "QF", "SF", "Bronze", "Final"].map(round => {
        const roundMatches = KNOCKOUT_MATCHES.filter(m => m.round === round);
        const roundPreds = roundMatches.filter(m => predictions[m.id]);
        if (roundPreds.length === 0) return null;
        return (
          <div key={round} className="mb-3">
            <p className="text-[#4A6B8A] text-[9px] font-black uppercase tracking-widest mb-1.5">{ROUND_LABELS[round]}</p>
            {roundPreds.map(match => {
              const pred = predictions[match.id];
              const winner = knockoutResults?.[match.id]?.winner || null;
              const isCorrect = winner && pred === winner;
              const predTeam = getTeam(pred);
              const homeCode = knockoutTeams[match.h] || match.h;
              const awayCode = knockoutTeams[match.a] || match.a;
              const homeTeam = /^[A-Z]{3}$/.test(homeCode) ? getTeam(homeCode) : null;
              const awayTeam = /^[A-Z]{3}$/.test(awayCode) ? getTeam(awayCode) : null;
              return (
                <div key={match.id} className="flex items-center text-xs py-1.5 border-b border-[#003F88]/50 last:border-0 gap-1.5">
                  {homeTeam
                    ? <FlagImg iso={homeTeam.iso} size={20} className="rounded-sm flex-shrink-0" />  
                    : <span className="w-5 flex-shrink-0" />}
                  <span className="text-[#4A6B8A] flex-shrink-0 text-[9px]">{homeTeam?.code || match.h}</span>
                  <span className="text-[#4A6B8A] flex-shrink-0 text-[9px]">v</span>
                  {awayTeam
                    ? <FlagImg iso={awayTeam.iso} size={20} className="rounded-sm flex-shrink-0" />  
                    : <span className="w-5 flex-shrink-0" />}
                  <span className="text-[#4A6B8A] flex-shrink-0 text-[9px]">{awayTeam?.code || match.a}</span>
                  <span className="flex-1" />
                  {predTeam?.iso ? (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <FlagImg iso={predTeam.iso} size={20} className="rounded-sm" />  {/* ← was 16 */}
                      <span className="text-[#7BA3D4] font-medium">{predTeam.code}</span>
                    </div>
                  ) : (
                    <span className="text-[#4A6B8A] flex-shrink-0">{pred}</span>
                  )}
                  {winner && (
                    <span className={`font-black w-6 text-right flex-shrink-0 ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                      {isCorrect ? "+2" : "✗"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </>
  );
}


// ── Fixtures Tab ──────────────────────────────────────────────────────────────
function FixturesTab({ results }) {
  const allDates = [...new Set(GROUP_STAGE_MATCHES.map((m) => m.date))]
    .sort((a, b) => new Date(`${a} 2026`) - new Date(`${b} 2026`));
  const today = `Jun ${new Date().getDate()}`;
  const defaultDate = allDates.includes(today) ? today : allDates[0];
  const [activeDate, setActiveDate] = useState(defaultDate);
  const scrollRef = useRef(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const activeBtn = container.querySelector("[data-active='true']");
    if (activeBtn) activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeDate]);

  const dateMatches = GROUP_STAGE_MATCHES.filter((m) => m.date === activeDate);

  return (
    <div>
      <div ref={scrollRef} className="flex gap-1.5 overflow-x-auto pb-3 mb-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {allDates.map((date) => {
          const isActive = activeDate === date;
          const allFinished = GROUP_STAGE_MATCHES.filter((m) => m.date === date).every((m) => results[m.id]);
          const someResult = GROUP_STAGE_MATCHES.filter((m) => m.date === date).some((m) => results[m.id]);
          return (
            <button key={date} data-active={isActive} onClick={() => setActiveDate(date)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-black transition-all relative ${
                isActive ? "bg-[#FFD700] text-[#001A3D]" : "bg-[#002657] text-[#7BA3D4] hover:bg-[#003F88]"
              }`}>
              {date}
              {allFinished && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full" />}
              {someResult && !allFinished && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full" />}
            </button>
          );
        })}
      </div>
      <p className="text-[#4A6B8A] text-[10px] uppercase tracking-wider mb-3">
        {dateMatches.length} matches · {dateMatches.filter((m) => results[m.id]).length} results in
      </p>
      <div className="space-y-2">
        {dateMatches.map((match) => {
          const home = getTeam(match.home);
          const away = getTeam(match.away);
          const result = results[match.id];
          const winner = result ? (typeof result === "object" ? result.winner : result) : null;
          const homeScore = result?.homeScore;
          const awayScore = result?.awayScore;
          const isFinished = winner !== null;
          return (
            <div key={match.id} className={`bg-[#002657] border rounded-xl px-4 py-3 flex items-center gap-3 transition-all ${isFinished ? "border-[#003F88]" : "border-[#003F88]/50"}`}>
              <span className="text-[#FFD700] text-[9px] font-black bg-[#FFD700]/10 px-1.5 py-0.5 rounded flex-shrink-0">{match.group}</span>
              <div className="flex items-center gap-2 flex-1 justify-end">
                <span className={`text-sm font-bold truncate ${isFinished ? winner === match.home ? "text-white" : "text-[#4A6B8A]" : "text-[#7BA3D4]"}`}>{home.code}</span>
                <FlagImg iso={home.iso} size={24} className="rounded-sm flex-shrink-0" />
              </div>
              <div className="flex flex-col items-center w-16 flex-shrink-0">
                {isFinished && homeScore != null ? (
                  <>
                    <span className="text-white font-black text-base leading-none">{homeScore} - {awayScore}</span>
                    {winner === "DRAW"
                      ? <span className="text-[#7BA3D4] text-[9px] font-black mt-0.5">DRAW</span>
                      : <span className="text-green-400 text-[9px] font-black tracking-widest mt-0.5">FT</span>}
                  </>
                ) : (
                  <>
                    <span className="text-[#FFD700] text-xs font-black">VS</span>
                    <span className="text-[#4A6B8A] text-[9px] mt-0.5 text-center leading-tight">{match.venue}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 flex-1">
                <FlagImg iso={away.iso} size={24} className="rounded-sm flex-shrink-0" />
                <span className={`text-sm font-bold truncate ${isFinished ? winner === match.away ? "text-white" : "text-[#4A6B8A]" : "text-[#7BA3D4]"}`}>{away.code}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Knockout Leaderboard Tab ──────────────────────────────────────────────────
function KnockoutLeaderboardTab({ leaderboard, player, myEntry, myRank, knockoutResults, knockoutUnlocked, knockoutTeams = {}, onGoKnockout }) {
  const resultsCount = Object.keys(knockoutResults).length;
  const [viewPlayer, setViewPlayer] = useState(null);

  if (!knockoutUnlocked) {
    return (
      <div className="text-center py-20">
        <p className="text-6xl mb-4">🔒</p>
        <h3 className="text-white font-black text-2xl mb-2">Knockout Stage Locked</h3>
        <p className="text-[#7BA3D4] text-sm max-w-xs mx-auto">The admin hasn't opened knockout predictions yet. Check back soon!</p>
      </div>
    );
  }

  // ── Top 3 podium data ─────────────────────────────────────────────────────
  const top3 = leaderboard.slice(0, 3);
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean); // 2nd, 1st, 3rd

  return (
    <>
      {/*  
      {!player?.isGuest && onGoKnockout && (
        <div className="mb-5 relative overflow-hidden bg-gradient-to-r from-[#FFD700]/20 via-[#FFD700]/10 to-[#FFD700]/20 border border-[#FFD700]/40 rounded-2xl px-5 py-4">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-32 h-32 bg-[#FFD700] rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#FFD700] rounded-full blur-3xl" />
          </div>
          <div className="relative flex items-center gap-4">
            <span className="text-4xl flex-shrink-0">🏆</span>
            <div className="flex-1 min-w-0">
              <p className="text-[#FFD700] font-black text-sm mb-0.5">Knockout predictions are open!</p>
              <p className="text-[#7BA3D4] text-xs">Pick winners for each match as teams are confirmed.</p>
            </div>
            <button
              onClick={onGoKnockout}
              className="flex-shrink-0 bg-[#FFD700] hover:bg-[#FFC200] text-[#001A3D] font-black text-xs py-2 px-4 rounded-xl transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              Pick Now →
            </button>
          </div>
        </div>
      )}
        */}

      {/* ── My rank card ── */}
      {myEntry && (
        <div className="mb-5 relative overflow-hidden rounded-2xl border border-[#FFD700]/30 bg-gradient-to-br from-[#FFD700]/10 to-transparent px-5 py-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-full bg-[#FFD700]/20 border-2 border-[#FFD700]/50 flex items-center justify-center">
                <span className="text-2xl">{myRank <= 3 ? ["🥇","🥈","🥉"][myRank-1] : `#${myRank}`}</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <FlagImg iso={player?.avatarFlag?.iso} size={20} className="rounded-sm flex-shrink-0" />
                <p className="text-[#FFD700] font-black text-base truncate">{player?.name}</p>
              </div>
              <p className="text-[#7BA3D4] text-xs">Knockout rank · {myEntry.correct}/{myEntry.total} correct</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-white font-black text-3xl leading-none">{myEntry.score}</p>
              <p className="text-[#FFD700] text-[10px] font-bold uppercase tracking-wider">pts</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Progress bar ── */}
      {resultsCount > 0 && (
        <div className="mb-5 bg-[#002657] border border-[#003F88] rounded-xl px-4 py-3">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-[#7BA3D4] font-medium">Knockout progress</span>
            <span className="text-[#FFD700] font-bold">{resultsCount}/31 results in</span>
          </div>
          <div className="h-2 bg-[#001A3D] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(100, (resultsCount / 31) * 100)}%`,
                background: 'linear-gradient(90deg, #FFD700, #FFC200)',
                boxShadow: '0 0 8px rgba(255,215,0,0.5)',
              }}
            />
          </div>
          {/* Round breakdown */}
          <div className="flex gap-2 mt-2.5 flex-wrap">
            {["R32","R16","QF","SF","Bronze","Final"].map(round => {
              const total = { R32:16, R16:8, QF:4, SF:2, Bronze:1, Final:1 }[round];
              const done = Object.entries(knockoutResults).filter(([id]) => {
                const m = KNOCKOUT_MATCHES.find(x => x.id === id);
                return m?.round === round;
              }).length;
              return (
                <div key={round} className="flex items-center gap-1">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    done === total ? "bg-green-500/20 text-green-400" : done > 0 ? "bg-yellow-500/20 text-yellow-400" : "bg-[#001A3D] text-[#4A6B8A]"
                  }`}>
                    {round} {done}/{total}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Podium (top 3) ── */}
      {leaderboard.length >= 2 && (
  <div className="mb-5">
    <p className="text-[#4A6B8A] text-[10px] font-medium uppercase tracking-widest mb-4 text-center">🏆 Top Players</p>
    <div className="flex items-end justify-center gap-3">
      {podiumOrder.map((p, podiumIdx) => {
        const actualRank = leaderboard.indexOf(p) + 1;
        const isFirst = actualRank === 1;
        const isMe = p.name === player?.name;
        const medals = ["🥇","🥈","🥉"];
        const heights = ["h-20", "h-28", "h-14"][podiumIdx];
        const colors = [
          "from-[#C0C0C0]/30 border-[#C0C0C0]/40 text-[#C0C0C0]",
          "from-[#FFD700]/30 border-[#FFD700]/40 text-[#FFD700]",
          "from-[#CD7F32]/30 border-[#CD7F32]/40 text-[#CD7F32]",
        ][podiumIdx];

        return (
          <div key={p.name} className="flex flex-col items-center flex-1 max-w-[130px]">
            {/* Player info */}
            <div className={`flex flex-col items-center mb-2 ${isFirst ? "scale-105" : ""}`}>
              <span className="text-xl mb-1">{medals[actualRank - 1]}</span>
              <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center overflow-hidden ${
                isMe ? "border-[#FFD700]" : "border-[#003F88]"
              }`}>
                <FlagImg iso={p.avatarFlag?.iso} size={48} className="rounded-full" />
              </div>
              {/* Bigger, full name */}
              <p className={`text-[15px] font-medium mt-1.5 text-center w-full px-1 leading-tight ${isMe ? "text-[#FFD700]" : "text-white"}`}>
                {p.name}
              </p>
              {/* Bigger score */}
              <p className={`text-sm font-medium mt-0.5 ${isFirst ? "text-[#FFD700]" : "text-[#7BA3D4]"}`}>
                {p.score} <span className="text-[10px] font-normal">pts</span>
              </p>
              <p className="text-[#4A6B8A] text-[9px]">{p.correct}/{p.total} ✓</p>
            </div>
            {/* Podium block */}
            <div className={`w-full ${heights} rounded-t-lg bg-gradient-to-b ${colors} border border-t flex items-center justify-center`}>
              <span className="text-xs font-black opacity-60">#{actualRank}</span>
            </div>
          </div>
        );
      })}
    </div>
  </div>
)}
      {/* ── Full leaderboard ── */}
      {leaderboard.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-3">🏆</p>
          <p className="text-[#7BA3D4] font-medium">No knockout predictions submitted yet.</p>
          <p className="text-[#4A6B8A] text-sm mt-1">Be the first to lock in your picks!</p>
        </div>
      ) : (
        <>
          <p className="text-[#4A6B8A] text-[10px] font-black uppercase tracking-widest mb-3">All Players</p>
          <div className="space-y-2">
            {leaderboard.map((p, i) => {
              const isMe = p.name === player?.name;
              const isTop3 = i < 3;
              return (
                <div key={p.name}>
                  <button
                    onClick={() => setViewPlayer(viewPlayer?.name === p.name ? null : p)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                      isMe
                        ? "border-[#FFD700]/40 bg-[#FFD700]/5"
                        : "border-[#003F88] bg-[#002657] hover:border-[#7BA3D4]"
                    }`}
                  >
                    {/* Rank */}
                    <span className="text-xl w-7 text-center flex-shrink-0">
                      {isTop3
                        ? ["🥇","🥈","🥉"][i]
                        : <span className="text-[#4A6B8A] text-sm font-bold">#{i+1}</span>
                      }
                    </span>

                    {/* Flag */}
                    <FlagImg iso={p.avatarFlag?.iso} size={24} className="rounded-sm flex-shrink-0" />

                    {/* Name */}
                    <span className={`font-bold flex-1 truncate text-sm ${isMe ? "text-[#FFD700]" : "text-white"}`}>
                      {p.name}
                      {isMe && <span className="text-[#4A6B8A] text-[10px] font-normal ml-1">(you)</span>}
                    </span>

                    {/* Score */}
                    <div className="text-right flex-shrink-0">
                      <p className={`font-black text-lg leading-tight ${isTop3 ? "text-[#FFD700]" : "text-white"}`}>
                        {p.score} pts
                      </p>
                      <p className="text-[#4A6B8A] text-[9px]">{p.correct}/{p.total} correct</p>
                    </div>

                    <span className="text-[#4A6B8A] text-xs ml-1">{viewPlayer?.name === p.name ? "▲" : "▼"}</span>
                  </button>

                  {/* Expanded knockout picks */}
                  {viewPlayer?.name === p.name && (
                    <div className="bg-[#001E4A] border border-[#003F88] rounded-2xl p-4 mt-1">
                      <div className="flex items-center gap-2 mb-3">
                        <FlagImg iso={p.avatarFlag?.iso} size={24} className="rounded-sm" />
                        <span className="text-white font-black text-sm">{p.name}'s Knockout Picks</span>
                        <span className="ml-auto text-[#FFD700] font-black text-sm">{p.score} pts</span>
                      </div>
                      <KnockoutPicksRows
                        predictions={p.knockoutPredictions || {}}
                        knockoutResults={knockoutResults}
                        knockoutTeams={knockoutTeams}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}