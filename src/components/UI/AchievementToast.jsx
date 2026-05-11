import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ACHIEVEMENTS } from '../../utils/achievements';

export default function AchievementToast({ ids = [], onDismiss }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!ids.length) return;
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss?.(), 400);
    }, 3000);
    return () => clearTimeout(t);
  }, [ids.join(',')]);

  if (!ids.length) return null;

  const firstAch = ACHIEVEMENTS.find(a => a.id === ids[0]);
  if (!firstAch) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed top-4 left-1/2 z-[100] pointer-events-none"
          style={{ transform: 'translateX(-50%)' }}
          initial={{ opacity: 0, y: -30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3 border border-indigo-500/40 shadow-lg shadow-indigo-500/20 max-w-xs">
            <div className="text-2xl">{firstAch.icon}</div>
            <div>
              <div className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Başarım Açıldı!</div>
              <div className="text-sm font-bold text-white">{firstAch.title}</div>
            </div>
            {ids.length > 1 && (
              <div className="ml-auto text-xs text-slate-400 font-medium">+{ids.length - 1}</div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
