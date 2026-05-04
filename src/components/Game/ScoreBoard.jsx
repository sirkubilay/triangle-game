import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function PlayerCard({ id, name, score, isActive, isAI, color }) {
  const prevScore = useRef(score);
  const popped = score !== prevScore.current;
  useEffect(() => { prevScore.current = score; });

  const borderColor  = hexToRgba(color, 0.45);
  const glowColor    = hexToRgba(color, 0.22);
  const textColor    = color;
  const dotColor     = color;

  return (
    <motion.div
      className="flex-1 glass rounded-xl sm:rounded-2xl p-2 sm:p-3 border transition-all duration-300"
      style={{
        borderColor,
        opacity: isActive ? 1 : 0.6,
        boxShadow: isActive ? `0 4px 16px ${glowColor}` : 'none',
      }}
      animate={isActive ? { scale: 1.02 } : { scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Name row */}
      <div className="flex items-center gap-1.5 mb-0.5">
        <div
          className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'pulse-glow' : ''}`}
          style={{ background: dotColor }}
        />
        <span className="text-xs font-medium truncate" style={{ color: textColor }}>{name}</span>
        {isAI && (
          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1 rounded-full border border-emerald-500/30 shrink-0">AI</span>
        )}
      </div>

      {/* Score */}
      <motion.div
        key={score}
        className="text-3xl sm:text-4xl font-black text-center leading-none"
        style={{ color: textColor }}
        animate={popped ? { scale: [1, 1.45, 1] } : {}}
        transition={{ duration: 0.35 }}
      >
        {score}
      </motion.div>

      {isActive && (
        <div className="text-[10px] text-center opacity-70 mt-0.5" style={{ color: textColor }}>▼ sıran</div>
      )}
    </motion.div>
  );
}

export default function ScoreBoard({ gs, isAITurn }) {
  if (!gs) return null;
  const { scores, playerNames, currentPlayer, mode, playerColors } = gs;
  const c1 = playerColors?.[1] ?? '#818cf8';
  const c2 = playerColors?.[2] ?? '#fb7185';
  const totalMoves    = gs.lines.length;
  const totalPossible = (gs.points.length * (gs.points.length - 1)) / 2;
  const pct           = Math.round((totalMoves / totalPossible) * 100);

  return (
    <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2">
      <PlayerCard id={1} name={playerNames[1]} score={scores[1]} isActive={currentPlayer === 1} isAI={false}           color={c1} />

      {/* Middle: move counter */}
      <div className="flex flex-col items-center gap-1 shrink-0 w-12 sm:w-16">
        <div className="text-[10px] text-slate-600 font-semibold tracking-wide">HAMLE</div>
        <div className="text-sm sm:text-base font-bold text-slate-400 leading-none">{totalMoves}</div>
        <div className="text-[10px] text-slate-700">/{totalPossible}</div>
        <div className="w-10 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-slate-500 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <PlayerCard id={2} name={playerNames[2]} score={scores[2]} isActive={currentPlayer === 2} isAI={mode === 'vsAI'} color={c2} />
    </div>
  );
}
