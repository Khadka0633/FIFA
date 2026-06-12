import { useEffect, useState, useRef } from "react";
import { getAllPlayers, getResults, sendChatMessage, getChat  } from "../utils/firebase";
import { buildLeaderboard } from "../utils/scoring";
import { GROUP_STAGE_MATCHES, getTeam, GROUPS } from "../data/matches";
import FlagImg from "../components/FlagImg";



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
            <FlagImg iso={player.avatarFlag?.iso} size={24} className="rounded-sm" />
            <span className="text-[#7BA3D4] text-sm font-medium">{player.name}</span>
          </div>
          <button onClick={onBack} className="text-[#4A6B8A] hover:text-white text-sm transition-colors">
            ← Back
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-2xl mx-auto px-4 pb-3 flex gap-2">
  {["board", "chat", "mypicks", "knockout"].map((t) => (
    <button
      key={t}
      onClick={() => setTab(t)}
      className={`relative px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide transition-all ${
        tab === t ? "bg-[#FFD700] text-[#001A3D]" : "bg-[#002657] text-[#7BA3D4] hover:bg-[#003F88]"
      }`}
    >
      {t === "board" ? "🏆 Rankings"
      : t === "chat" ? "💬 Chat"
      : t === "mypicks" ? "⚽ My Picks"
      : "🔜 Knockout"}
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
                  <p className="text-[#4A6B8A] text-[10px] uppercase">{myEntry.correct}/{myEntry.total} correct</p>
                </div>
              </div>
            )}

            {/* Results progress bar */}
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
                  <div key={p.name}>
                    <button
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
                      <FlagImg iso={p.avatarFlag?.iso} size={24} className="rounded-sm flex-shrink-0" />
                      <span className="text-white font-bold flex-1 truncate">{p.name}</span>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[#FFD700] font-black text-lg leading-tight">{p.score} pts</p>
                        <p className="text-[#4A6B8A] text-[9px]">{p.correct}/{p.total} correct</p>
                      </div>
                      <span className="text-[#4A6B8A] text-xs ml-1">{viewPlayer?.name === p.name ? "▲" : "▼"}</span>
                    </button>
                    {viewPlayer?.name === p.name && (
                      <PlayerPicksView player={viewPlayer} results={results} />
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {tab === "chat" && (
  <ChatTab player={player} myEntry={myEntry} />
)}

        {tab === "mypicks" && myEntry && (
          <PlayerPicksView player={myEntry} results={results} highlight />
        )}

        {tab === "mypicks" && !myEntry && (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">⚽</p>
            <p className="text-[#7BA3D4] font-medium">No predictions found.</p>
            <p className="text-[#4A6B8A] text-sm mt-1">Submit your picks first!</p>
          </div>
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

// ── Live Scores Tab ────────────────────────────────────────────────────────────

function ChatTab({ player, myEntry }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    const unsub = getChat(setMessages);
    return () => { if (typeof unsub === "function") unsub(); };
  }, []);

  // Auto-scroll to bottom on new messages
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

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const canChat = !!myEntry; // only submitted players

  return (
    <div className="flex flex-col h-[70vh]">
      <div className="mb-3">
        <h2 className="text-white font-black text-lg">💬 Global Chat</h2>
        <p className="text-[#4A6B8A] text-[10px]">Trash talk, predictions, celebrations — all welcome</p>
      </div>

      {/* Messages */}
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
                    isMe
                      ? "bg-[#FFD700] text-[#001A3D] font-semibold rounded-br-sm"
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

      {/* Input */}
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

function PlayerPicksView({ player, results, highlight }) {
  const totalResults = Object.keys(results).length;

  return (
    <div className={`bg-[#002657] border border-[#003F88] rounded-2xl p-4 ${highlight ? "mt-0" : "mt-2"}`}>
      <div className="flex items-center gap-2 mb-4">
        <FlagImg iso={player.avatarFlag?.iso} size={28} className="rounded-sm" />
        <span className="text-white font-black">{player.name}'s Picks</span>
        <div className="ml-auto flex items-center gap-3">
          {totalResults > 0 && (
            <span className="text-[#7BA3D4] text-xs">{player.correct}/{player.total} correct</span>
          )}
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

              // ✅ Fix — extract winner from object or string
              const resultRaw = results[match.id];
              const winner = resultRaw
                ? (typeof resultRaw === "object" ? resultRaw.winner : resultRaw)
                : null;

              const home = getTeam(match.home);
              const away = getTeam(match.away);
              const isCorrect = winner && pred === winner;

              return (
                <div key={match.id} className="flex items-center text-xs py-1.5 border-b border-[#003F88]/50 last:border-0 gap-1.5">
                  {/* Match teams */}
                  <FlagImg iso={home.iso} size={16} className="rounded-sm flex-shrink-0" />
                  <span className="text-[#4A6B8A] flex-shrink-0">{home.code} v {away.code}</span>
                  <FlagImg iso={away.iso} size={16} className="rounded-sm flex-shrink-0" />

                  <span className="flex-1" />

                  {/* User's prediction only */}
                  {pred === "DRAW" ? (
                    <span className="text-[#7BA3D4] flex-shrink-0">🤝 Draw</span>
                  ) : pred ? (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <FlagImg iso={getTeam(pred).iso} size={16} className="rounded-sm" />
                      <span className="text-[#7BA3D4] font-medium">{getTeam(pred).code}</span>
                    </div>
                  ) : (
                    <span className="text-[#4A6B8A] flex-shrink-0">—</span>
                  )}

                  {/* ✅ Correct / wrong badge */}
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