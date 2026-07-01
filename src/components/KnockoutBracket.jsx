import { useEffect, useLayoutEffect, useRef, useState } from "react";
import FlagImg from "../components/FlagImg";
import { getTeam } from "../data/matches";

const GC = '#b2c7e6';
const R = 5;

// ── R32 — fully hardcoded ─────────────────────────────────────────────────────
const R32 = [
  {id:"R32_1",  h:"GER", a:"PAR", date:"Jun 29"},
  {id:"R32_2",  h:"FRA", a:"SWE", date:"Jun 30"},
  {id:"R32_3",  h:"RSA", a:"CAN", date:"Jun 28"},
  {id:"R32_4",  h:"NED", a:"MAR", date:"Jun 29"},
  {id:"R32_5",  h:"POR", a:"CRO", date:"Jul 3"},
  {id:"R32_6",  h:"ESP", a:"AUT", date:"Jul 2"},
  {id:"R32_7",  h:"USA", a:"BIH", date:"Jul 1"},
  {id:"R32_8",  h:"BEL", a:"SEN", date:"Jul 1"},
  {id:"R32_9",  h:"BRA", a:"JPN", date:"Jun 30"},
  {id:"R32_10", h:"CIV", a:"NOR", date:"Jun 30"},
  {id:"R32_11", h:"MEX", a:"ECU", date:"Jul 1"},
  {id:"R32_12", h:"ENG", a:"COD", date:"Jul 2"},
  {id:"R32_13", h:"ARG", a:"CPV", date:"Jul 3"},
  {id:"R32_14", h:"AUS", a:"EGY", date:"Jul 3"},
  {id:"R32_15", h:"SUI", a:"ALG", date:"Jul 2"},
  {id:"R32_16", h:"COL", a:"GHA", date:"Jun 29"},
];

// ── R16 — fill in winners as R32 completes ────────────────────────────────────
// h/a = team code of whoever won their R32 match, or null if not yet played
const R16L = [
  {id:"R16_1", h:"PAR", a:"FRA", date:"Jul 5"},
  {id:"R16_2", h:"CAN", a:"MAR", date:"Jul 4"},
  {id:"R16_3", h:"", a:"", date:"Jul 6"},
  {id:"R16_4", h:"", a:"", date:"Jul 7"},
];
const R16R = [
  {id:"R16_5", h:"BRA", a:"NOR", date:"Jul 5"},
  {id:"R16_6", h:"", a:"", date:"Jul 6"},
  {id:"R16_7", h:"", a:"", date:"Jul 7"},
  {id:"R16_8", h:"", a:"", date:"Jul 7"},
];

// ── QF — fill in as R16 completes ────────────────────────────────────────────
const QFL = [
  {id:"QF1", h:"TBD", a:"TBD", date:"Jul 9"},
  {id:"QF2", h:"TBD", a:"TBD", date:"Jul 10"},
];
const QFR = [
  {id:"QF3", h:"TBD", a:"TBD", date:"Jul 12"},
  {id:"QF4", h:"TBD", a:"TBD", date:"Jul 12"},
];

// ── SF ────────────────────────────────────────────────────────────────────────
const SFL = [{id:"SF1", h:"TBD", a:"TBD", date:"Jul 14"}];
const SFR = [{id:"SF2", h:"TBD", a:"TBD", date:"Jul 15"}];

// ── Final & Bronze ────────────────────────────────────────────────────────────
const FINAL  = {id:"F1", h:"TBD", a:"TBD", date:"Jul 19", badge:"final"};
const BRONZE = {id:"B1", h:"TBD", a:"TBD", date:"Jul 19", badge:"bronze"};

// ── Team row ──────────────────────────────────────────────────────────────────
function TeamRow({ code, isWinner, isLoser, score }) {
  const isTBD = !code || code === "TBD" || !/^[A-Z]{2,3}$/.test(code);
  const team = isTBD ? null : getTeam(code);

  return (
    <div className="flex items-center gap-1.5 px-1.5 py-1">
      {team
        ? <FlagImg iso={team.iso} size={20} className="rounded-sm flex-shrink-0" />
        : <div className="w-5 h-4 rounded-sm bg-[#0D2040] flex-shrink-0" />
      }
      <span className={`text-[8px] font-medium flex-1 truncate ${
        isWinner ? 'text-white' : isLoser ? 'text-[#1A3050]' : isTBD ? 'text-[#2A4060]' : 'text-[#4A6B8A]'
      }`}>
        {team ? team.code : (isTBD ? "TBD" : code)}
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
function MatchCard({ match, knockoutResults, width }) {
  const res = knockoutResults?.[match.id];
  const winner = res?.winner || (typeof res === "string" ? res : null);

  return (
    <div
      style={{ width }}
      className={`rounded-md overflow-hidden flex-shrink-0 border ${
        res ? 'border-[#FFD700]/20 bg-[#001E4A]' : 'border-[#0F3060] bg-[#001535]'
      }`}
    >
      <TeamRow
        code={match.h}
        isWinner={!!winner && winner === match.h}
        isLoser={!!winner && winner !== match.h}
        score={res?.homeScore}
      />
      <div className="h-px bg-[#0A2040]" />
      <TeamRow
        code={match.a}
        isWinner={!!winner && winner === match.a}
        isLoser={!!winner && winner !== match.a}
        score={res?.awayScore}
      />
      <div className="flex items-center justify-between px-1.5 py-0.5 bg-[#000E22]">
        <span className="text-[8px] text-white">{match.date}</span>
        {match.badge === 'final' && (
          <span className="text-[10px] font-bold text-yellow-400 bg-[#FFD700]/10 px-1 rounded">FINAL</span>
        )}
        {match.badge === 'bronze' && (
          <span className="text-[8px] font-bold text-[#CD7F32] bg-[#7BA3D4]/10 px-1 rounded">BRONZE</span>
        )}
        {res && !match.badge && (
          <span className="text-[6px] font-bold text-green-400">FT</span>
        )}
      </div>
    </div>
  );
}

// ── Round column ──────────────────────────────────────────────────────────────
function Round({ matches, label, width, gap, knockoutResults }) {
  return (
    <div className="flex flex-col self-stretch flex-shrink-0">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-white text-center mb-1">{label}</p>
      <div className="flex flex-col flex-1 justify-around" style={{ gap }}>
        {matches.map(m => (
          <MatchCard key={m.id} match={m} knockoutResults={knockoutResults} width={width} />
        ))}
      </div>
    </div>
  );
}

// ── Center column ─────────────────────────────────────────────────────────────
function CenterColumn({ knockoutResults, width }) {
  return (
    <div className="flex flex-col items-center gap-2 flex-shrink-0 px-1 pt-1">
      <div className="text-center">
        <div className="text-2xl mb-0.5" style={{ filter: 'grayscale(0.3)' }}>🏆</div>
        <p className="text-[15px] font-semibold uppercase tracking-widest text-yellow-400">Champion</p>
      </div>
      <MatchCard match={FINAL} knockoutResults={knockoutResults} width={width} />
      <div className="h-2" />
      <p className="text-[8px] font-semibold uppercase tracking-widest text-[#CD7F32]">Bronze</p>
      <MatchCard match={BRONZE} knockoutResults={knockoutResults} width={width} />
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function KnockoutBracket({ knockoutResults = {} }) {
  const outerRef   = useRef(null);
  const bracketRef = useRef(null);
  const svgRefs    = useRef([]);
  const [boxWidth, setBoxWidth] = useState(1100);

  useLayoutEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const update = () => setBoxWidth(Math.max(el.clientWidth, 900));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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
  }, [knockoutResults, mwS, mwM, mwL, mwC]);

  return (
    <div ref={outerRef}>
      <div className="mb-3">
        <h2 className="text-white font-black text-base leading-tight">🏆 Knockout Stage</h2>
        <p className="text-[#4A6B8A] text-[10px] mt-0.5">Live bracket — updating as results come in</p>
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
          <Round matches={R32.slice(0,8)}  label="R32" width={mwS} gap={2}  knockoutResults={knockoutResults} />
          <svg ref={el => addSvgRef(el,4,false)} width={cw} style={{flexShrink:0,alignSelf:'stretch',display:'block'}} />
          <Round matches={R16L}            label="R16" width={mwM} gap={4}  knockoutResults={knockoutResults} />
          <svg ref={el => addSvgRef(el,2,false)} width={cw} style={{flexShrink:0,alignSelf:'stretch',display:'block'}} />
          <Round matches={QFL}             label="QF"  width={mwM} gap={16} knockoutResults={knockoutResults} />
          <svg ref={el => addSvgRef(el,1,false)} width={cw} style={{flexShrink:0,alignSelf:'stretch',display:'block'}} />
          <Round matches={SFL}             label="SF"  width={mwL} gap={0}  knockoutResults={knockoutResults} />
          <div style={{width:6,borderTop:`1px solid ${GC}`,flexShrink:0,alignSelf:'center',marginTop:14}} />
          <CenterColumn knockoutResults={knockoutResults} width={mwC} />
          <div style={{width:6,borderTop:`1px solid ${GC}`,flexShrink:0,alignSelf:'center',marginTop:14}} />
          <Round matches={SFR}             label="SF"  width={mwL} gap={0}  knockoutResults={knockoutResults} />
          <svg ref={el => addSvgRef(el,1,true)} width={cw} style={{flexShrink:0,alignSelf:'stretch',display:'block'}} />
          <Round matches={QFR}             label="QF"  width={mwM} gap={16} knockoutResults={knockoutResults} />
          <svg ref={el => addSvgRef(el,2,true)} width={cw} style={{flexShrink:0,alignSelf:'stretch',display:'block'}} />
          <Round matches={R16R}            label="R16" width={mwM} gap={4}  knockoutResults={knockoutResults} />
          <svg ref={el => addSvgRef(el,4,true)} width={cw} style={{flexShrink:0,alignSelf:'stretch',display:'block'}} />
          <Round matches={R32.slice(8,16)} label="R32" width={mwS} gap={2}  knockoutResults={knockoutResults} />
        </div>
      </div>
    </div>
  );
}