import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import Button from '../UI/Button';
import { getDailyStars } from '../../utils/daily';
import { getDailyLeaderboard, getCachedUserId } from '../../utils/firestore';
import { loadStats } from '../../utils/storage';

const STAR_LABELS = ['', '⭐', '⭐⭐', '⭐⭐⭐'];

function DailyLeaderboard() {
  const [entries, setEntries] = useState(null);
  const myId = getCachedUserId();

  useEffect(() => {
    getDailyLeaderboard().then(setEntries);
  }, []);

  if (entries === null) {
    return <p className="text-xs text-slate-600 text-center py-2 animate-pulse">Sıralama yükleniyor…</p>;
  }
  if (entries.length === 0) return null;

  return (
    <div className="mt-4">
      <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-2 text-left">
        Bugünün Sıralaması
      </p>
      <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
        {entries.map((e, i) => {
          const isMe = e.userId === myId;
          return (
            <motion.div
              key={e.userId}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${
                isMe
                  ? 'bg-indigo-500/15 border border-indigo-500/30'
                  : 'bg-slate-800/50 border border-transparent'
              }`}
            >
              <span className="w-5 text-center text-xs font-bold text-slate-600">{i + 1}</span>
              <span className={`flex-1 truncate font-medium text-xs ${isMe ? 'text-indigo-300' : 'text-slate-300'}`}>
                {e.name}{isMe ? ' (sen)' : ''}
              </span>
              <span className="text-xs leading-none">{STAR_LABELS[e.stars] ?? ''}</span>
              <span className={`text-sm font-black ${isMe ? 'text-indigo-400' : 'text-amber-400'}`}>
                {e.score}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function DailyResult({ score, movesUsed, moveLimit }) {
  const stars = getDailyStars(score);

  useEffect(() => {
    if (stars >= 3) {
      confetti({ particleCount: 160, spread: 80, origin: { x: 0.5, y: 0.35 }, colors: ['#fbbf24', '#fff', '#ffd700'] });
    } else if (stars >= 1) {
      confetti({ particleCount: 80, spread: 60, origin: { x: 0.5, y: 0.4 }, colors: ['#818cf8', '#fff'] });
    }
  }, []);

  return (
    <>
      <div className="text-center">
        <div className="text-4xl mb-1">📅</div>
        <h2 className="text-xl font-black text-white mb-3">Günlük Bulmaca</h2>

        <motion.div
          className="text-3xl mb-3"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 16 }}
        >
          {stars > 0 ? STAR_LABELS[stars] : '—'}
        </motion.div>

        <div className="glass rounded-2xl px-6 py-3 border border-slate-700/40 mb-3">
          <div className="text-3xl font-black text-amber-400">{score}</div>
          <div className="text-xs text-slate-500">üçgen · {movesUsed}/{moveLimit} hamle</div>
        </div>

        <div className="grid grid-cols-3 gap-1.5 mb-2 text-xs">
          {[
            { label: '1+ üçgen', tier: 1 },
            { label: '3+ üçgen', tier: 2 },
            { label: '6+ üçgen', tier: 3 },
          ].map(({ label, tier }) => (
            <div key={tier}
              className={`rounded-xl py-1.5 border ${
                stars >= tier
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                  : 'border-slate-700/30 text-slate-700'
              }`}
            >
              <div>{STAR_LABELS[tier]}</div>
              <div className="text-[10px] mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <DailyLeaderboard />
    </>
  );
}

const MODE_LABEL = {
  '1v1': '1v1',
  vsAI: 'vs AI',
  timeAttack: '⚡ Zaman Saldırısı',
  daily: '📅 Günlük',
  online: '🌐 Online',
};

const DIFF_LABEL = { easy: 'Kolay', medium: 'Orta', hard: 'Zor' };

function currentStreak(history = []) {
  let s = 0;
  for (const e of history) { if (e.outcome === 'win') s++; else break; }
  return s;
}

export default function GameOverModal({ gs, onRestart, onMenu }) {
  if (!gs || gs.phase !== 'over') return null;
  const { winner, scores, playerNames, mode, playerColors, difficulty } = gs;
  const isDaily = mode === 'daily';
  const isDraw  = winner === 0;
  const p1Color = playerColors?.[1] ?? '#818cf8';
  const p2Color = playerColors?.[2] ?? '#fb7185';

  const stats  = loadStats();
  const streak = currentStreak(stats.history ?? []);
  const best   = stats.bestWinStreak ?? 0;
  const newBest = winner === 1 && streak > 0 && streak >= best;

  useEffect(() => {
    if (isDaily) return;
    if (isDraw || winner === null) return;
    const color = winner === 1 ? p1Color : p2Color;
    confetti({ particleCount: 140, spread: 75, origin: { x: 0.5, y: 0.35 }, colors: [color, '#ffffff', '#ffd700'] });
    setTimeout(() => confetti({ particleCount: 60, spread: 55, origin: { x: 0.2, y: 0.5 }, colors: [color, '#fff'] }), 300);
    setTimeout(() => confetti({ particleCount: 60, spread: 55, origin: { x: 0.8, y: 0.5 }, colors: [color, '#fff'] }), 500);
  }, []);

  let emoji, headline, sub;
  if (!isDaily) {
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
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm overflow-y-auto py-4">
      <motion.div
        className="glass rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl"
        initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 18, stiffness: 280 }}
      >
        {isDaily ? (
          <DailyResult
            score={scores[1] ?? 0}
            movesUsed={gs.movesUsed ?? 0}
            moveLimit={gs.moveLimit ?? 18}
          />
        ) : (
          <div className="text-center">
            {/* Mod etiketi */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-xs text-slate-500 bg-slate-800 border border-slate-700 rounded-full px-2.5 py-0.5">
                {MODE_LABEL[mode] ?? mode}
              </span>
              {mode === 'vsAI' && difficulty && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border"
                  style={{ color: difficulty === 'hard' ? '#f87171' : difficulty === 'medium' ? '#fbbf24' : '#34d399',
                           borderColor: difficulty === 'hard' ? '#f8717140' : difficulty === 'medium' ? '#fbbf2440' : '#34d39940',
                           background:  difficulty === 'hard' ? '#f8717110' : difficulty === 'medium' ? '#fbbf2410' : '#34d39910' }}>
                  {DIFF_LABEL[difficulty]}
                </span>
              )}
            </div>

            <motion.div
              className="text-6xl mb-3"
              animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              {emoji}
            </motion.div>
            <h2 className="text-2xl font-black text-white mb-1">{headline}</h2>
            <p className="text-slate-400 text-sm mb-4">{sub}</p>

            <div className="flex gap-3 mb-4">
              {[1, 2].map(id => (
                <div key={id} className="flex-1 rounded-xl py-3 border"
                  style={{
                    borderColor: `${playerColors?.[id] ?? (id === 1 ? '#818cf8' : '#fb7185')}44`,
                    background:  `${playerColors?.[id] ?? (id === 1 ? '#818cf8' : '#fb7185')}18`,
                  }}>
                  <div className="text-xs font-medium mb-1 px-2 truncate"
                    style={{ color: playerColors?.[id] ?? (id === 1 ? '#818cf8' : '#fb7185') }}>
                    {playerNames[id]}{mode === 'vsAI' && id === 2 ? ' 🤖' : ''}
                  </div>
                  <motion.div
                    className="text-3xl font-black"
                    style={{ color: playerColors?.[id] ?? (id === 1 ? '#818cf8' : '#fb7185') }}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 + id * 0.1, type: 'spring', stiffness: 260, damping: 16 }}
                  >
                    {scores[id]}
                  </motion.div>
                </div>
              ))}
            </div>

            {/* Seri bilgisi */}
            {winner === 1 && streak > 0 && (
              <motion.div
                className={`rounded-xl px-4 py-2 mb-4 text-sm font-semibold ${
                  newBest
                    ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300'
                    : 'bg-orange-500/10 border border-orange-500/30 text-orange-400'
                }`}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              >
                {newBest ? `🏅 Yeni En İyi Seri: ${streak}!` : `🔥 Seri: ${streak} galibiyet`}
              </motion.div>
            )}
          </div>
        )}

        <div className="flex gap-3 mt-2">
          <Button onClick={onMenu}    variant="ghost"   className="flex-1">Ana Menü</Button>
          <Button onClick={onRestart} variant="primary" className="flex-1">
            {isDaily ? 'Tekrar Dene' : 'Tekrar Oyna'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
