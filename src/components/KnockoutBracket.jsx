import { useEffect, useLayoutEffect, useRef, useState } from "react";
import FlagImg from "../components/FlagImg";
import { getTeam, GROUP_STAGE_MATCHES, GROUPS } from "../data/matches";
import { SLOT_MAP, isGroupComplete, calcGroupStandings } from "../utils/qualifyTeams";

const GC = '#b2c7e6';
const R = 5;

// ── REPLACE the entire R32 array with correct slots ───────────────────────────
const R32 = [
  {id:"R32_1",  h:"1E",  a:"3CD", date:"Jun 29"},
  {id:"R32_2",  h:"1I",  a:"3AB", date:"Jun 30"},
  {id:"R32_3",  h:"2A",  a:"2B",  date:"Jun 28"},
  {id:"R32_4",  h:"1F",  a:"2C",  date:"Jun 29"},
  {id:"R32_5",  h:"1K",  a:"3EH", date:"Jul 3" },
  {id:"R32_6",  h:"1H",  a:"2J",  date:"Jul 2" },
  {id:"R32_7",  h:"1D",  a:"3BE", date:"Jul 1" },
  {id:"R32_8",  h:"1G",  a:"3AE", date:"Jul 1" },
  {id:"R32_9",  h:"1A",  a:"3DE", date:"Jun 30"},
  {id:"R32_10", h:"2E",  a:"2I",  date:"Jun 30"},
  {id:"R32_11", h:"1L",  a:"3CE", date:"Jul 1" },
  {id:"R32_12", h:"1B",  a:"3EF", date:"Jul 2" },
  {id:"R32_13", h:"1J",  a:"2H",  date:"Jul 3" },
  {id:"R32_14", h:"2D",  a:"2G",  date:"Jul 3" },
  {id:"R32_15", h:"2K",  a:"2L",  date:"Jul 2" },
  {id:"R32_16", h:"1C",  a:"2F",  date:"Jun 29"},
];


const R16L = [
  {id:"R16_1",h:"1EA",a:"1IC",date:"Jul 5"},{id:"R16_2",h:"2AB",a:"1FC",date:"Jul 4"},
  {id:"R16_3",h:"2KL",a:"1HJ",date:"Jul 6"},{id:"R16_4",h:"1DB",a:"1GA",date:"Jul 7"},
];
const R16R = [
  {id:"R16_5",h:"1CF",a:"2EI",date:"Jul 5"},{id:"R16_6",h:"1AC",a:"1LE",date:"Jul 6"},
  {id:"R16_7",h:"1JH",a:"2DG",date:"Jul 7"},{id:"R16_8",h:"1BE",a:"1KD",date:"Jul 7"},
];
const QFL = [
  {id:"QF1",h:"EF1",a:"EF2",date:"Jul 9"},
  {id:"QF2",h:"EF5",a:"EF6",date:"Jul 10"},
];
const QFR = [
  {id:"QF3",h:"EF3",a:"EF4",date:"Jul 12"},
  {id:"QF4",h:"EF7",a:"EF8",date:"Jul 12"},
];
const SFL = [{id:"SF1",h:"WQ1",a:"WQ2",date:"Jul 14"}];
const SFR = [{id:"SF2",h:"WQ3",a:"WQ4",date:"Jul 15"}];
const FINAL  = {id:"F", h:"WS1",a:"WS2",date:"Jul 19",badge:"final"};
const BRONZE = {id:"B", h:"LS1",a:"LS2",date:"Jul 19",badge:"bronze"};

// ── Confirmed-only filter ────────────────────────────────────────────────────
// Takes the live (always "as it stands") knockoutTeams map and strips out
// any slot whose underlying group(s) aren't fully finished yet.
// ✅ Shows team as soon as their qualification is mathematically certain
function getConfirmedTeams(knockoutTeams, results) {
  const out = {};

  Object.entries(SLOT_MAP).forEach(([slot, rule]) => {
    if (!knockoutTeams[slot]) return;

    if (rule.group) {
      const groupMatches = GROUP_STAGE_MATCHES.filter(m => m.group === rule.group);
      const played = groupMatches.filter(m => results[m.id]).length;
      const standings = calcGroupStandings(rule.group, results);

      if (played === 0) return; // no matches played yet

      // ✅ Check if top team is mathematically confirmed
      if (rule.pos === 1 && standings[0]) {
        const top = standings[0];
        const second = standings[1];
        // Top team confirmed if their points gap is insurmountable
        const remaining = 6 - played;
        const maxSecond = second ? second.pts + remaining * 3 : 0;
        if (top.pts > maxSecond || isGroupComplete(rule.group, results)) {
          out[slot] = knockoutTeams[slot];
        }
      }

      // ✅ Runner-up confirmed only when group fully done
      if (rule.pos === 2 && isGroupComplete(rule.group, results)) {
        out[slot] = knockoutTeams[slot];
      }

    } else if (rule.thirds) {
      // Third place only when ALL groups done
      const allDone = GROUPS.every(g => isGroupComplete(g, results));
      if (allDone) out[slot] = knockoutTeams[slot];
    }
  });

  return out;
}
// ── Team row ──────────────────────────────────────────────────────────────────
function TeamRow({ code, isWinner, isLoser, score, resolvedCode, tentative }) {
  const isPlaceholder = !resolvedCode || !/^[A-Z]{2,3}$/.test(resolvedCode);
  const team = isPlaceholder ? null : getTeam(resolvedCode);

  return (
    <div className="flex items-center gap-1.5 px-1.5 py-1">
      {team
        ? <FlagImg iso={team.iso} size={14} className={`rounded-sm flex-shrink-0 ${tentative ? 'opacity-60' : ''}`} />
        : <div className="w-4 h-3 rounded-sm bg-[#0D2040] flex-shrink-0" />
      }
      <span className={`text-[8px] font-medium flex-1 truncate ${
        isWinner ? 'text-white' : isLoser ? 'text-[#1A3050]' : 'text-[#4A6B8A]'
      } ${tentative ? 'italic opacity-70' : ''}`}>
        {team ? team.code : (resolvedCode || code)}
      </span>
      {score != null && (
        <span className={`text-[8px] font-bold ml-auto flex-shrink-0 ${
          isWinner ? 'text-white' : 'text-[#1A3050]'
        }`}>{score}</span>
      )}
    </div>
  );
}
// ── Match card ────────────────────────────────────────────────────────────────
function MatchCard({ match, knockoutResults, knockoutTeams, width, tentativeSlots }) {
  const res = knockoutResults?.[match.id];
  const winner = res?.winner || (typeof res === "string" ? res : null);

  // ✅ Read home/away from match-level knockoutTeams[match.id]
  const matchTeams = knockoutTeams?.[match.id];
  const homeCode = matchTeams?.home || null;
  const awayCode = matchTeams?.away || null;

  const hTentative = tentativeSlots?.has(match.h);
  const aTentative = tentativeSlots?.has(match.a);

  return (
    <div
      style={{ width }}
      className={`rounded-md overflow-hidden flex-shrink-0 border ${
        res ? 'border-[#FFD700]/20 bg-[#001E4A]'
          : (hTentative || aTentative) ? 'border-dashed border-[#4A6B8A]/50 bg-[#001535]'
          : 'border-[#0F3060] bg-[#001535]'
      }`}
    >
      <TeamRow
        code={match.h}
        resolvedCode={homeCode}
        isWinner={winner && winner === homeCode}
        isLoser={winner && winner !== homeCode && !!awayCode}
        score={res?.homeScore}
        tentative={hTentative}
      />
      <div className="h-px bg-[#0A2040]" />
      <TeamRow
        code={match.a}
        resolvedCode={awayCode}
        isWinner={winner && winner === awayCode}
        isLoser={winner && winner !== awayCode && !!homeCode}
        score={res?.awayScore}
        tentative={aTentative}
      />
      <div className="flex items-center justify-between px-1.5 py-0.5 bg-[#000E22]">
        <span className="text-[8px] text-white">{match.date}</span>
        {match.badge === 'final' && <span className="text-[10px] font-bold text-yellow-400 bg-[#FFD700]/10 px-1 rounded">FINAL</span>}
        {match.badge === 'bronze' && <span className="text-[8px] font-bold text-[#CD7F32] bg-[#7BA3D4]/10 px-1 rounded">BRONZE</span>}
        {res && !match.badge && <span className="text-[6px] font-bold text-green-400">FT</span>}
      </div>
    </div>
  );
}
// ── Round column ──────────────────────────────────────────────────────────────
function Round({ matches, label, width, gap, knockoutResults, knockoutTeams, tentativeSlots }) {
  return (
    <div className="flex flex-col self-stretch flex-shrink-0">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-white text-center mb-1">{label}</p>
      <div className="flex flex-col flex-1 justify-around" style={{ gap }}>
        {matches.map(m => (
          <MatchCard key={m.id} match={m} knockoutResults={knockoutResults} knockoutTeams={knockoutTeams} width={width} tentativeSlots={tentativeSlots} />
        ))}
      </div>
    </div>
  );
}

// ── Center column ─────────────────────────────────────────────────────────────
function CenterColumn({ knockoutResults, knockoutTeams, width, tentativeSlots }) {
  return (
    <div className="flex flex-col items-center gap-2 flex-shrink-0 px-1 pt-1">
      <div className="text-center">
        <div className="text-2xl mb-0.5" style={{ filter: 'grayscale(0.3)' }}>🏆</div>
        <p className="text-[15px] font-semibold uppercase tracking-widest text-yellow-400">Champion</p>
      </div>
      <MatchCard match={FINAL} knockoutResults={knockoutResults} knockoutTeams={knockoutTeams} width={width} tentativeSlots={tentativeSlots} />
      <div className="h-2" />
      <p className="text-[8px] font-semibold uppercase tracking-widest text-[#CD7F32]">Bronze</p>
      <MatchCard match={BRONZE} knockoutResults={knockoutResults} knockoutTeams={knockoutTeams} width={width} tentativeSlots={tentativeSlots} />
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function KnockoutBracket({ knockoutResults = {}, knockoutTeams = {} }) {
  const outerRef   = useRef(null);
  const bracketRef = useRef(null);
  const svgRefs    = useRef([]);
  const [boxWidth, setBoxWidth] = useState(1100);
  const [mode, setMode] = useState("projected"); // "projected" = "As it stands", "confirmed" = locked-in only

  useLayoutEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const update = () => setBoxWidth(Math.max(el.clientWidth, 900));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Confirmed-only data + tentative-slot set ────────────────────────────────
  const confirmedTeams = getConfirmedTeams(knockoutTeams, knockoutResults);
 const tentativeSlots = new Set(
  Object.keys(confirmedTeams).length > 0
    ? Object.keys(knockoutTeams).filter((slot) => knockoutTeams[slot] && !confirmedTeams[slot])
    : [] // ✅ no tentative styling when nothing confirmed yet
);

const confirmedIsEmpty = Object.keys(confirmedTeams).length === 0;
const displayTeams = mode === "confirmed"
  ? (confirmedIsEmpty ? knockoutTeams : confirmedTeams)
  : knockoutTeams;
const activeTentativeSlots = mode === "confirmed" ? new Set() : tentativeSlots;

  const cw      = 16;
  const PADDING = 24;
  const HLINES  = 12;
  const rawUnit = (boxWidth - PADDING - HLINES - 8 * cw) / 10.9375;
  const unit    = Math.min(100, Math.max(56, rawUnit));
  const mwS = Math.round(unit);
  const mwM = Math.round(unit * 1.1875);
  const mwL = Math.round(unit * 1.3125);
  const mwC = Math.round(unit * 1.5625);

  svgRefs.current = [];
  const addSvgRef = (el, pairs, right) => {
    if (el) svgRefs.current.push({ el, pairs, right, w: cw });
  };

  const drawConnectors = () => {
    if (!bracketRef.current) return;
    const bh = bracketRef.current.getBoundingClientRect().height;
    if (!bh) return;
    svgRefs.current.forEach(({ el, pairs, right, w }) => {
      if (!el) return;
      const h = bh - 20;
      el.setAttribute('width', w);
      el.setAttribute('height', h);
      el.setAttribute('viewBox', `0 0 ${w} ${h}`);
      el.innerHTML = '';
      const segH = h / pairs;
      for (let i = 0; i < pairs; i++) {
        const topY = segH * i + segH * 0.25;
        const midY = segH * i + segH * 0.5;
        const botY = segH * i + segH * 0.75;
        const r    = Math.min(R, segH * 0.12);
        const d = right
          ? `M ${w} ${topY} L ${w} ${midY-r} Q ${w} ${midY} ${w-r} ${midY} L 0 ${midY}
             M ${w} ${botY} L ${w} ${midY+r} Q ${w} ${midY} ${w-r} ${midY}`
          : `M 0 ${topY} L 0 ${midY-r} Q 0 ${midY} ${r} ${midY} L ${w} ${midY}
             M 0 ${botY} L 0 ${midY+r} Q 0 ${midY} ${r} ${midY}`;
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('stroke', GC);
        path.setAttribute('stroke-width', '1.5');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-linecap', 'round');
        el.appendChild(path);
      }
    });
  };

  useEffect(() => {
    const el = bracketRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => requestAnimationFrame(drawConnectors));
    ro.observe(el);
    requestAnimationFrame(drawConnectors);
    return () => ro.disconnect();
  }, [knockoutResults, displayTeams, mwS, mwM, mwL, mwC]);

  return (
    <div ref={outerRef}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-white font-black text-base leading-tight">🏆 Knockout Stage</h2>
          <p className="text-[#4A6B8A] text-[10px] mt-0.5">
  {mode === "projected"
    ? "Showing projected pairings based on current standings"
    : confirmedIsEmpty
      ? "No teams confirmed yet — showing projections"
      : "Showing only mathematically confirmed pairings"}
</p>
        </div>
        <div className="flex gap-1 bg-[#001535] border border-[#0F3060] rounded-lg p-1 flex-shrink-0">
          <button
            onClick={() => setMode("projected")}
            className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wide transition-all ${
              mode === "projected" ? "bg-white text-[#001A3D]" : "text-[#7BA3D4] hover:text-white"
            }`}
          >
            As it stands
          </button>
          <button
            onClick={() => setMode("confirmed")}
            className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wide transition-all ${
              mode === "confirmed" ? "bg-white text-[#001A3D]" : "text-[#7BA3D4] hover:text-white"
            }`}
          >
            Confirmed
          </button>
        </div>
      </div>

      <div className="overflow-x-auto -mx-1 px-1">
        <div
          ref={bracketRef}
          className="rounded-xl p-3 flex items-center justify-center"
          style={{
            minHeight: 540,
            minWidth: 900,
            width: '100%',
            background: 'linear-gradient(180deg, #224074 0%, #263961 100%)',
          }}
        >
          <Round matches={R32.slice(0,8)} label="R32" width={mwS} gap={2} knockoutResults={knockoutResults} knockoutTeams={displayTeams} tentativeSlots={activeTentativeSlots} />
          <svg ref={el => addSvgRef(el,4,false)} width={cw} style={{flexShrink:0,alignSelf:'stretch',display:'block'}} />
          <Round matches={R16L} label="R16" width={mwM} gap={4} knockoutResults={knockoutResults} knockoutTeams={displayTeams} tentativeSlots={activeTentativeSlots} />
          <svg ref={el => addSvgRef(el,2,false)} width={cw} style={{flexShrink:0,alignSelf:'stretch',display:'block'}} />
          <Round matches={QFL} label="QF" width={mwM} gap={16} knockoutResults={knockoutResults} knockoutTeams={displayTeams} tentativeSlots={activeTentativeSlots} />
          <svg ref={el => addSvgRef(el,1,false)} width={cw} style={{flexShrink:0,alignSelf:'stretch',display:'block'}} />
          <Round matches={SFL} label="SF" width={mwL} gap={0} knockoutResults={knockoutResults} knockoutTeams={displayTeams} tentativeSlots={activeTentativeSlots} />
          <div style={{width:6,borderTop:`1px solid ${GC}`,flexShrink:0,alignSelf:'center',marginTop:14}} />
          <CenterColumn knockoutResults={knockoutResults} knockoutTeams={displayTeams} width={mwC} tentativeSlots={activeTentativeSlots} />
          <div style={{width:6,borderTop:`1px solid ${GC}`,flexShrink:0,alignSelf:'center',marginTop:14}} />
          <Round matches={SFR} label="SF" width={mwL} gap={0} knockoutResults={knockoutResults} knockoutTeams={displayTeams} tentativeSlots={activeTentativeSlots} />
          <svg ref={el => addSvgRef(el,1,true)} width={cw} style={{flexShrink:0,alignSelf:'stretch',display:'block'}} />
          <Round matches={QFR} label="QF" width={mwM} gap={16} knockoutResults={knockoutResults} knockoutTeams={displayTeams} tentativeSlots={activeTentativeSlots} />
          <svg ref={el => addSvgRef(el,2,true)} width={cw} style={{flexShrink:0,alignSelf:'stretch',display:'block'}} />
          <Round matches={R16R} label="R16" width={mwM} gap={4} knockoutResults={knockoutResults} knockoutTeams={displayTeams} tentativeSlots={activeTentativeSlots} />
          <svg ref={el => addSvgRef(el,4,true)} width={cw} style={{flexShrink:0,alignSelf:'stretch',display:'block'}} />
          <Round matches={R32.slice(8,16)} label="R32" width={mwS} gap={2} knockoutResults={knockoutResults} knockoutTeams={displayTeams} tentativeSlots={activeTentativeSlots} />
        </div>
      </div>
    </div>
  );
}