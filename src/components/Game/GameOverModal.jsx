import { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import Button from '../UI/Button';

export default function GameOverModal({ gs, onRestart, onMenu }) {
  if (!gs || gs.phase !== 'over') return null;
  const { winner, scores, playerNames, mode, playerColors } = gs;
  const isDraw = winner === 0;
  const p1Color = playerColors?.[1] ?? '#818cf8';
  const p2Color = playerColors?.[2] ?? '#fb7185';

  useEffect(() => {
    if (isDraw || winner === null) return;
    const color = winner === 1 ? p1Color : p2Color;
    confetti({ particleCount: 140, spread: 75, origin: { x: 0.5, y: 0.35 }, colors: [color, '#ffffff', '#ffd700'] });
    setTimeout(() => confetti({ particleCount: 60, spread: 55, origin: { x: 0.2, y: 0.5 }, colors: [color, '#fff'] }), 300);
    setTimeout(() => confetti({ particleCount: 60, spread: 55, origin: { x: 0.8, y: 0.5 }, colors: [color, '#fff'] }), 500);
  }, []);

  let emoji, headline, sub;
  if (isDraw) {
    emoji = '🤝'; headline = 'Berabere!';
    sub = `Her iki oyuncu da ${scores[1]} üçgen yaptı.`;
  } else if (winner === 1) {
    emoji = '🏆'; headline = `${playerNames[1]} Kazandı!`;
    sub = `${scores[1]} – ${scores[2]}. Harika oyun!`;
  } else {
    emoji = mode === 'vsAI' ? '🤖' : '🎉';
    headline = `${playerNames[2]} Kazandı!`;
    sub = `${scores[2]} – ${scores[1]}. ${mode === 'vsAI' ? 'Daha iyi strateji dene!' : 'Tebrikler!'}`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm">
      <motion.div
        className="glass rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl"
        initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 18, stiffness: 280 }}
      >
        <motion.div
          className="text-6xl mb-3"
          animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {emoji}
        </motion.div>
        <h2 className="text-2xl font-black text-white mb-2">{headline}</h2>
        <p className="text-slate-400 text-sm mb-6">{sub}</p>

        <div className="flex gap-3 mb-6">
          {[1, 2].map(id => (
            <div key={id} className="flex-1 rounded-xl py-3 border"
              style={{ borderColor: `${(playerColors?.[id] ?? (id === 1 ? '#818cf8' : '#fb7185'))}44`,
                       background: `${(playerColors?.[id] ?? (id === 1 ? '#818cf8' : '#fb7185'))}18` }}>
              <div className="text-xs font-medium mb-1 px-2 truncate"
                style={{ color: playerColors?.[id] ?? (id === 1 ? '#818cf8' : '#fb7185') }}>
                {playerNames[id]}{mode === 'vsAI' && id === 2 ? ' (AI)' : ''}
              </div>
              <div className="text-3xl font-black" style={{ color: playerColors?.[id] ?? (id === 1 ? '#818cf8' : '#fb7185') }}>
                {scores[id]}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button onClick={onMenu}    variant="ghost"   className="flex-1">Ana Menü</Button>
          <Button onClick={onRestart} variant="primary" className="flex-1">Tekrar Oyna</Button>
        </div>
      </motion.div>
    </div>
  );
}
