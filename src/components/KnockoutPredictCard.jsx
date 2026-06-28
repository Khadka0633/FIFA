import FlagImg from "./FlagImg";
import { getTeam } from "../data/matches";

export default function KnockoutPredictCard({ match, knockoutTeams, prediction, onPick, locked, result, round }) {
  const resolveTeam = (slot) => {
    const code = knockoutTeams?.[slot] || slot;
    return /^[A-Z]{3}$/.test(code) ? getTeam(code) : null;
  };

  const homeTeam = resolveTeam(match.h);
  const awayTeam = resolveTeam(match.a);
  const winner = result?.winner;
  const isFinished = !!winner;
  const bothKnown = homeTeam && awayTeam;


  return (

    
    <div className={`relative bg-[#002657] border rounded-xl overflow-hidden transition-all ${
      prediction ? "border-[#FFD700]/40" : "border-[#003F88]/60"
    } ${locked ? "opacity-90" : "hover:border-[#7BA3D4]"}`}>

      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-2.5 pb-0">
        <span className="text-[#4A6B8A] text-[10px] font-medium uppercase tracking-wider">{match.date}</span>
        <div className="flex items-center gap-1.5">
          {isFinished && <span className="bg-green-500/10 text-green-400 text-[9px] font-black px-1.5 py-0.5 rounded tracking-widest">FT</span>}
          <span className="bg-[#FFD700]/10 text-[#FFD700] text-[9px] font-black px-1.5 py-0.5 rounded tracking-widest">{round}</span>
        </div>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between px-4 py-3 gap-1">
        <div className="flex flex-col items-center w-[38%]">
          {homeTeam
            ? <><FlagImg iso={homeTeam.iso} size={48} className="rounded-md shadow-sm" />
                <span className="text-white text-[11px] font-bold mt-1.5 text-center leading-tight">{homeTeam.name}</span>
                <span className="text-[#4A6B8A] text-[9px] font-black uppercase tracking-widest mt-0.5">{homeTeam.code}</span></>
            : <><div className="w-12 h-9 bg-[#001535] rounded-md" />
                <span className="text-[#4A6B8A] text-[10px] mt-1.5 font-bold">TBD</span></>
          }
        </div>

        <div className="flex flex-col items-center flex-shrink-0">
          {isFinished && result?.homeScore != null
            ? <span className="text-green-400 font-black text-lg leading-none">{result.homeScore} - {result.awayScore}</span>
            : <span className="text-[#FFD700] text-xs font-black tracking-widest">VS</span>
          }
        </div>

        <div className="flex flex-col items-center w-[38%]">
          {awayTeam
            ? <><FlagImg iso={awayTeam.iso} size={48} className="rounded-md shadow-sm" />
                <span className="text-white text-[11px] font-bold mt-1.5 text-center leading-tight">{awayTeam.name}</span>
                <span className="text-[#4A6B8A] text-[9px] font-black uppercase tracking-widest mt-0.5">{awayTeam.code}</span></>
            : <><div className="w-12 h-9 bg-[#001535] rounded-md" />
                <span className="text-[#4A6B8A] text-[10px] mt-1.5 font-bold">TBD</span></>
          }
        </div>
      </div>

      <div className="h-px bg-[#003F88]/50 mx-3" />

      {/* Pick buttons — only if both teams known */}
      {bothKnown && !locked ? (
        <div className="flex gap-1.5 p-2.5">
          {[homeTeam, awayTeam].map((team) => (
            <button
              key={team.code}
              onClick={() => onPick(match.id, team.code)}
              className={`flex-1 flex flex-col items-center py-2 px-1 rounded-lg border transition-all ${
                prediction === team.code
                  ? "border-[#FFD700] bg-[#FFD700]/15 text-[#FFD700] scale-95"
                  : "border-[#003F88] bg-[#001A3D] text-[#7BA3D4] hover:border-[#7BA3D4]"
              }`}
            >
              <FlagImg iso={team.iso} size={24} className="rounded-sm" />
              <span className="text-[9px] font-bold mt-1 uppercase tracking-wide">{team.code}</span>
            </button>
          ))}
        </div>
      ) : bothKnown && locked && prediction ? (
        <div className="flex items-center gap-2 px-3 py-2.5">
          <span className="text-[#4A6B8A] text-[10px]">Your pick:</span>
          {(() => { const t = getTeam(prediction); return (
            <div className="flex items-center gap-1.5">
              <FlagImg iso={t.iso} size={16} className="rounded-sm" />
              <span className={`text-xs font-bold ${
                isFinished ? (winner === prediction ? "text-green-400" : "text-red-400") : "text-[#FFD700]"
              }`}>{t.code}</span>
              {isFinished && <span className="font-black text-xs">{winner === prediction ? "+2 ✓" : "✗"}</span>}
            </div>
          );})()}
        </div>
      ) : !bothKnown ? (
        <div className="px-3 py-2.5 text-center">
          <span className="text-[#4A6B8A] text-[10px]">Teams not yet determined</span>
        </div>
      ) : null}

      {prediction && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFD700] opacity-70" />}
    </div>
  );
}