import FlagImg from "./FlagImg";
import { getTeam } from "../data/matches";

export default function KnockoutPredictCard({ match, knockoutTeams, prediction, onPick, locked, result, round, saving }) {
  const resolveTeam = (slot) => {
    const code = /^[A-Z]{3}$/.test(slot) ? slot : knockoutTeams?.[slot] || slot;
    return /^[A-Z]{3}$/.test(code) ? getTeam(code) : null;
  };

  const homeTeam = resolveTeam(match.h);
  const awayTeam = resolveTeam(match.a);
  const winner = result?.winner;
  const isFinished = !!winner;
  const bothKnown = homeTeam && awayTeam;
  const hasPick = !!prediction;

  return (
    <div className={`relative bg-[#002657] border rounded-xl overflow-hidden transition-all ${
      hasPick
        ? locked
          ? "border-green-500/30"
          : "border-[#FFD700]/40"
        : "border-[#003F88]/60"
    } ${!locked && bothKnown ? "hover:border-[#7BA3D4]" : ""}`}>

      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-2.5 pb-0">
        <span className="text-[#4A6B8A] text-[10px] font-medium uppercase tracking-wider">{match.date}</span>
        <div className="flex items-center gap-1.5">
          {isFinished && (
            <span className="bg-green-500/10 text-green-400 text-[9px] font-black px-1.5 py-0.5 rounded tracking-widest">FT</span>
          )}
          {locked && hasPick && !isFinished && (
            <span className="bg-[#003F88] text-[#7BA3D4] text-[9px] font-black px-1.5 py-0.5 rounded tracking-widest">🔒</span>
          )}
          <span className="bg-[#FFD700]/10 text-[#FFD700] text-[9px] font-black px-1.5 py-0.5 rounded tracking-widest">{round}</span>
        </div>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between px-4 py-3 gap-1">
        {/* Home */}
        <div className="flex flex-col items-center w-[38%]">
          {homeTeam ? (
            <>
              <FlagImg iso={homeTeam.iso} size={48} className="rounded-md shadow-sm" />
              <span className="text-white text-[11px] font-bold mt-1.5 text-center leading-tight">{homeTeam.name}</span>
              <span className="text-[#4A6B8A] text-[9px] font-black uppercase tracking-widest mt-0.5">{homeTeam.code}</span>
            </>
          ) : (
            <>
              <div className="w-12 h-9 bg-[#001535] rounded-md animate-pulse" />
              <span className="text-[#4A6B8A] text-[10px] mt-1.5 font-bold">TBD</span>
            </>
          )}
        </div>

        {/* Score / VS */}
        <div className="flex flex-col items-center flex-shrink-0">
          {isFinished && result?.homeScore != null ? (
            <span className="text-green-400 font-black text-lg leading-none">
              {result.homeScore} - {result.awayScore}
            </span>
          ) : (
            <span className="text-[#FFD700] text-xs font-black tracking-widest">VS</span>
          )}
        </div>

        {/* Away */}
        <div className="flex flex-col items-center w-[38%]">
          {awayTeam ? (
            <>
              <FlagImg iso={awayTeam.iso} size={48} className="rounded-md shadow-sm" />
              <span className="text-white text-[11px] font-bold mt-1.5 text-center leading-tight">{awayTeam.name}</span>
              <span className="text-[#4A6B8A] text-[9px] font-black uppercase tracking-widest mt-0.5">{awayTeam.code}</span>
            </>
          ) : (
            <>
              <div className="w-12 h-9 bg-[#001535] rounded-md animate-pulse" />
              <span className="text-[#4A6B8A] text-[10px] mt-1.5 font-bold">TBD</span>
            </>
          )}
        </div>
      </div>

      <div className="h-px bg-[#003F88]/50 mx-3" />

      {/* Bottom section */}
      {saving ? (
        // Saving spinner
        <div className="px-3 py-2.5 text-center">
          <span className="text-[#FFD700] text-[10px] animate-pulse">⏳ Saving your pick...</span>
        </div>

      ) : bothKnown && !locked ? (
        // Pick buttons — unlocked, both teams known
        <div className="flex gap-1.5 p-2.5">
          {[homeTeam, awayTeam].map((team) => (
            <button
              key={team.code}
              onClick={() => onPick(match.id, team.code)}
              className={`flex-1 flex flex-col items-center py-2 px-1 rounded-lg border transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.97] ${
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

      ) : bothKnown && locked && hasPick ? (
        // Locked with a pick — show result
        <div className="flex items-center gap-2 px-3 py-2.5 bg-[#001535]">
          <span className="text-[#4A6B8A] text-[10px] flex-shrink-0">
            {isFinished ? "Your pick:" : "🔒 Locked:"}
          </span>
          {(() => {
            const t = getTeam(prediction);
            return (
              <div className="flex items-center gap-1.5 flex-1">
                <FlagImg iso={t.iso} size={20} className="rounded-sm flex-shrink-0" />
                <span className={`text-xs font-bold ${
                  isFinished
                    ? winner === prediction ? "text-green-400" : "text-red-400"
                    : "text-[#FFD700]"
                }`}>
                  {t.code}
                </span>
                {isFinished && (
                  <span className={`font-black text-xs ml-auto ${
                    winner === prediction ? "text-green-400" : "text-red-400"
                  }`}>
                    {winner === prediction ? "+2 ✓" : "✗"}
                  </span>
                )}
              </div>
            );
          })()}
        </div>

      ) : bothKnown && locked && !hasPick ? (
        // Locked by admin before player picked
        <div className="px-3 py-2.5 text-center bg-[#001535]">
          <span className="text-red-400 text-[10px] font-bold">🔒 Locked — no pick made</span>
        </div>

      ) : !bothKnown ? (
        // Teams not known yet
        <div className="px-3 py-2.5 text-center">
          <span className="text-[#4A6B8A] text-[10px]">⏳ Teams not yet determined</span>
        </div>

      ) : null}

      {/* Bottom gold bar for picked matches */}
      {hasPick && (
        <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${
          isFinished
            ? winner === prediction ? "bg-green-400" : "bg-red-400"
            : "bg-[#FFD700]"
        } opacity-70`} />
      )}
    </div>
  );
}