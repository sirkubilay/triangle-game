import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HintButton({ hintMoves, onReveal }) {
  const [adWatched, setAdWatched] = useState(false);
  const [showAd, setShowAd]       = useState(false);
  const hasHint = hintMoves.length > 0;

  function handleClick() {
    if (!hasHint) return;
    if (adWatched) { onReveal(hintMoves[0]); return; }
    setShowAd(true);
  }

  function watchAd() {
    // Gerçek reklam entegrasyonu için burası kullanılır
    setTimeout(() => {
      setAdWatched(true);
      setShowAd(false);
      onReveal(hintMoves[0]);
    }, 2000); // Simüle: 2 sn "reklam"
  }

  return (
    <>
      <motion.button
        onClick={handleClick}
        disabled={!hasHint}
        className={`relative flex items-center justify-center w-10 h-10 rounded-xl border transition-all
          ${hasHint
            ? 'border-amber-500/50 bg-amber-500/10 cursor-pointer'
            : 'border-slate-700 bg-slate-800/50 cursor-not-allowed opacity-40'
          }`}
        title={hasHint ? 'İpucu: Üçgen kapatılabilir!' : 'Şu an üçgen kapatılabilecek hamle yok'}
        animate={hasHint ? { scale: [1, 1.08, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1.6 }}
      >
        <span className={`text-lg ${hasHint ? 'text-amber-400' : 'text-slate-600'}`}>💡</span>
        {hasHint && !adWatched && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
        )}
      </motion.button>

      {/* Simüle reklam modalı */}
      <AnimatePresence>
        {showAd && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass rounded-2xl p-6 max-w-xs w-full mx-4 text-center"
              initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
            >
              <div className="text-4xl mb-3">📺</div>
              <h3 className="text-white font-bold mb-2">İpucunu Aç</h3>
              <p className="text-slate-400 text-sm mb-4">Kısa bir reklam izleyerek ipucunu ücretsiz kullanabilirsin.</p>
              <div className="text-xs text-slate-500 mb-4 italic">(Reklam simülasyonu — 2 sn)</div>
              <div className="flex gap-3">
                <button onClick={() => setShowAd(false)} className="flex-1 py-2 rounded-xl border border-slate-600 text-slate-400 text-sm">Vazgeç</button>
                <button onClick={watchAd} className="flex-1 py-2 rounded-xl bg-amber-500 text-white text-sm font-semibold">İzle ▶</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
