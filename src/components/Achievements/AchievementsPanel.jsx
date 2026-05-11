import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { ACHIEVEMENTS } from '../../utils/achievements';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

export default function AchievementsPanel() {
  const { goToMenu, achievements } = useApp();
  const unlockedCount = Object.keys(achievements).length;

  return (
    <div className="full-screen overflow-y-auto" style={{ backgroundColor: 'var(--c-bg)' }}>
      <div className="w-full max-w-md mx-auto px-4 py-6">
        <button onClick={goToMenu} className="text-slate-500 active:text-slate-300 mb-5 flex items-center gap-1 text-sm py-1">
          ← Geri
        </button>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-white">Başarımlar</h2>
          <div className="glass rounded-full px-3 py-1 text-xs text-indigo-400 font-semibold border border-indigo-500/30">
            {unlockedCount} / {ACHIEVEMENTS.length}
          </div>
        </div>

        {/* Progress bar */}
        <div className="glass rounded-2xl p-4 mb-6 border border-slate-700/50">
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>İlerleme</span>
            <span>{Math.round((unlockedCount / ACHIEVEMENTS.length) * 100)}%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-indigo-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%` }}
              transition={{ delay: 0.2, duration: 0.6 }}
            />
          </div>
        </div>

        {/* Achievement grid */}
        <div className="grid grid-cols-2 gap-3">
          {ACHIEVEMENTS.map((ach, i) => {
            const date = achievements[ach.id];
            const unlocked = !!date;

            return (
              <motion.div
                key={ach.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className={`glass rounded-2xl p-4 border transition-all ${
                  unlocked
                    ? 'border-indigo-500/40 bg-indigo-500/5'
                    : 'border-slate-700/30 opacity-50'
                }`}
              >
                <div className={`text-3xl mb-2 ${unlocked ? '' : 'grayscale'}`}>
                  {ach.icon}
                </div>
                <div className={`text-sm font-bold mb-1 ${unlocked ? 'text-white' : 'text-slate-500'}`}>
                  {ach.title}
                </div>
                <div className="text-xs text-slate-600 leading-tight">
                  {unlocked ? ach.desc : '???'}
                </div>
                {unlocked && date && (
                  <div className="text-xs text-indigo-400/70 mt-2 font-medium">
                    {formatDate(date)}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}
