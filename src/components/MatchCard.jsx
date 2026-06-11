import { getTeam } from "../data/matches";
import FlagImg from "./FlagImg";

export default function MatchCard({ match, prediction, onPick, locked, result, liveScore }) {
  const home = getTeam(match.home);
  const away = getTeam(match.away);

  const isLive = liveScore?.status === "LIVE";
const winner = result ? (typeof result === "object" ? result.winner : result) : null;
const isFinished = winner !== null;

  const options = [
    { value: match.home, label: home.iso, sub: home.code },
    { value: "DRAW",     label: null,      sub: "Draw"     },
    { value: match.away, label: away.iso,  sub: away.code  },
  ];

  return (
    <div className={`relative bg-[#002657] border rounded-xl overflow-hidden transition-all ${
      prediction ? "border-[#FFD700]/40" : "border-[#003F88]/60"
    } ${isLive ? "border-red-500/60" : ""} ${locked ? "opacity-90" : "hover:border-[#7BA3D4]"}`}>

      {/* Group badge + date */}
      <div className="flex items-center justify-between px-3 pt-2.5 pb-0">
        <p className="text-[#4A6B8A] text-[10px] font-medium uppercase tracking-wider">
          {match.date} · {match.venue}
        </p>
        <div className="flex items-center gap-1.5">
          {isLive && (
            <span className="flex items-center gap-1 bg-red-500/20 text-red-400 text-[9px] font-black px-1.5 py-0.5 rounded tracking-widest animate-pulse">
              🔴 LIVE
            </span>
          )}
          {isFinished && !isLive && (
            <span className="bg-green-500/10 text-green-400 text-[9px] font-black px-1.5 py-0.5 rounded tracking-widest">
              FT
            </span>
          )}
          <span className="bg-[#FFD700]/10 text-[#FFD700] text-[9px] font-black px-1.5 py-0.5 rounded tracking-widest">
            GRP {match.group}
          </span>
        </div>
      </div>

      {/* Teams row */}
      <div className="flex items-center justify-between px-4 py-3 gap-1">
        {/* Home team */}
        <div className="flex flex-col items-center w-[38%]">
          <FlagImg iso={home.iso} size={48} className="rounded-md shadow-sm" />
          <span className="text-white text-[11px] font-bold mt-1.5 text-center leading-tight">{home.name}</span>
          <span className="text-[#4A6B8A] text-[9px] font-black uppercase tracking-widest mt-0.5">{home.code}</span>
        </div>

        {/* VS / Score */}
        <div className="flex flex-col items-center flex-shrink-0">
          {isLive && liveScore ? (
            <span className="text-white font-black text-lg leading-none">
              {liveScore.home} - {liveScore.away}
            </span>
          )  : isFinished && result?.homeScore != null ? (
    <span className="text-green-400 font-black text-lg leading-none">
      {result.homeScore} - {result.awayScore}
    </span>
          ) : (
            <span className="text-[#FFD700] text-xs font-black tracking-widest">VS</span>
          )}
        </div>

        {/* Away team */}
        <div className="flex flex-col items-center w-[38%]">
          <FlagImg iso={away.iso} size={48} className="rounded-md shadow-sm" />
          <span className="text-white text-[11px] font-bold mt-1.5 text-center leading-tight">{away.name}</span>
          <span className="text-[#4A6B8A] text-[9px] font-black uppercase tracking-widest mt-0.5">{away.code}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#003F88]/50 mx-3" />

      {/* Pick buttons */}
      <div className="flex gap-1.5 p-2.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            disabled={locked}
            onClick={() => !locked && onPick(match.id, opt.value)}
            className={`flex-1 flex flex-col items-center py-2 px-1 rounded-lg border transition-all text-center ${
              prediction === opt.value
                ? "border-[#FFD700] bg-[#FFD700]/15 text-[#FFD700] scale-95"
                : "border-[#003F88] bg-[#001A3D] text-[#7BA3D4] hover:border-[#7BA3D4]"
            } ${locked ? "cursor-default" : "cursor-pointer hover:scale-[1.02] active:scale-[0.97]"}`}
          >
            {opt.label
              ? <FlagImg iso={opt.label} size={24} className="rounded-sm" />
              : <span className="text-xl leading-none">🤝</span>
            }
            <span className="text-[9px] font-bold mt-1 uppercase tracking-wide leading-none">{opt.sub}</span>
          </button>
        ))}
      </div>

      {/* Bottom selected bar */}
      {prediction && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFD700] opacity-70" />
      )}

      {/* Live glow border */}
      {isLive && (
        <div className="absolute inset-0 rounded-xl ring-1 ring-red-500/40 pointer-events-none" />
      )}
    </div>
  );
}