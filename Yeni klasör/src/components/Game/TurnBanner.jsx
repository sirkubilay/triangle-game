import { motion, AnimatePresence } from 'framer-motion';

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function TurnBanner({ gs, isAITurn, lastScoredTriangles }) {
  if (!gs || gs.phase === 'over') return null;
  const { currentPlayer, playerNames, mode, playerColors } = gs;

  const color     = playerColors?.[currentPlayer] ?? (currentPlayer === 1 ? '#818cf8' : '#fb7185');
  const name      = playerNames[currentPlayer];
  const isAI      = mode === 'vsAI' && currentPlayer === 2;
  const hasBonus  = lastScoredTriangles > 0;

  return (
    <div className="px-2 sm:px-4 pb-1">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentPlayer}-${gs.lines.length}`}
          className="flex items-center justify-center gap-2 py-1 px-3 rounded-xl border text-xs sm:text-sm font-semibold"
          style={{
            color,
            borderColor: hexToRgba(color, 0.3),
            background:  hexToRgba(color, 0.07),
          }}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.18 }}
        >
          {isAI ? (
            <span className="pulse-glow">🤖 Bilgisayar düşünüyor…</span>
          ) : (
            <>
              <span className="truncate max-w-[120px] sm:max-w-none">{name} oynuyor</span>
              {hasBonus && (
                <span className="text-amber-400 text-[10px] sm:text-xs font-bold bg-amber-400/10 px-1.5 py-0.5 rounded-full border border-amber-400/30 shrink-0 whitespace-nowrap">
                  +{lastScoredTriangles} 🔥 tekrar!
                </span>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
