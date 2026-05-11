import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SLIDES = [
  {
    title: 'Noktaları Seç',
    desc: 'İki noktaya tıklayarak aralarına çizgi çek. Çizgiler kesişemez!',
    svg: (
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <circle cx="30" cy="40" r="8" fill="#818cf8" opacity="0.9"/>
        <circle cx="90" cy="40" r="8" fill="#818cf8" opacity="0.9"/>
        <line x1="38" y1="40" x2="82" y2="40" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6 4" opacity="0.7"/>
        <circle cx="30" cy="40" r="14" fill="none" stroke="#818cf8" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="4 3"/>
      </svg>
    ),
  },
  {
    title: 'Üçgen Kapat',
    desc: '3 çizgi bir üçgen oluşturduğunda puan kazanırsın!',
    svg: (
      <svg viewBox="0 0 120 90" className="w-full h-full">
        <polygon points="60,15 20,75 100,75" fill="#818cf8" fillOpacity="0.22" stroke="#818cf8" strokeWidth="2.2" strokeLinejoin="round"/>
        <circle cx="60" cy="15" r="6" fill="#818cf8"/>
        <circle cx="20" cy="75" r="6" fill="#818cf8"/>
        <circle cx="100" cy="75" r="6" fill="#818cf8"/>
        <text x="60" y="55" textAnchor="middle" fontSize="14" fill="#fbbf24" fontWeight="bold">+1</text>
      </svg>
    ),
  },
  {
    title: 'Sıra Avantajı',
    desc: 'Bir turda üçgen kapatırsan sıra sende kalır — arka arkaya puan topla!',
    svg: (
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <circle cx="40" cy="40" r="16" fill="#818cf8" fillOpacity="0.2" stroke="#818cf8" strokeWidth="2"/>
        <text x="40" y="45" textAnchor="middle" fontSize="16" fill="#818cf8">👤</text>
        <path d="M 62 35 Q 80 40 62 45" stroke="#34d399" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <polygon points="62,45 70,43 66,50" fill="#34d399"/>
        <text x="88" y="45" textAnchor="middle" fontSize="11" fill="#34d399" fontWeight="bold">Tekrar!</text>
      </svg>
    ),
  },
  {
    title: 'Kesiştirme Yasak',
    desc: 'Mevcut çizgileri kesen bir çizgi çekemezsin. Kırmızı = yasak!',
    svg: (
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <line x1="20" y1="20" x2="100" y2="60" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="20" y1="60" x2="100" y2="20" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 4" opacity="0.8"/>
        <circle cx="60" cy="40" r="12" fill="none" stroke="#ef4444" strokeWidth="2.5" opacity="0.7"/>
        <line x1="52" y1="32" x2="68" y2="48" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/>
        <line x1="68" y1="32" x2="52" y2="48" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/>
      </svg>
    ),
  },
  {
    title: 'En Çok Üçgen Kazanır',
    desc: 'Hamle kalmayınca oyun biter. En fazla üçgeni kapatan kazanır!',
    svg: (
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <rect x="10" y="15" width="45" height="50" rx="8" fill="#818cf8" fillOpacity="0.12" stroke="#818cf8" strokeWidth="1.5" strokeOpacity="0.4"/>
        <text x="32" y="38" textAnchor="middle" fontSize="10" fill="#818cf8" fontWeight="600">Oyuncu</text>
        <text x="32" y="55" textAnchor="middle" fontSize="22" fill="#818cf8" fontWeight="900">5</text>
        <rect x="65" y="15" width="45" height="50" rx="8" fill="#fb7185" fillOpacity="0.12" stroke="#fb7185" strokeWidth="1.5" strokeOpacity="0.4"/>
        <text x="87" y="38" textAnchor="middle" fontSize="10" fill="#fb7185" fontWeight="600">Rakip</text>
        <text x="87" y="55" textAnchor="middle" fontSize="22" fill="#fb7185" fontWeight="900">3</text>
        <text x="60" y="10" textAnchor="middle" fontSize="9" fill="#fbbf24">🏆</text>
      </svg>
    ),
  },
];

export default function HowToPlay({ onClose }) {
  const [slide, setSlide] = useState(0);

  function prev() { setSlide(s => Math.max(0, s - 1)); }
  function next() {
    if (slide < SLIDES.length - 1) setSlide(s => s + 1);
    else onClose();
  }

  const current = SLIDES[slide];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        className="glass rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-700/50"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 text-lg">✕</button>

        {/* SVG illustration */}
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            className="w-full h-36 mb-5"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            {current.svg}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={`text-${slide}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-xl font-black text-white mb-2 text-center">{current.title}</h3>
            <p className="text-sm text-slate-400 text-center leading-relaxed">{current.desc}</p>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-5 mb-4">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)}
              className={`rounded-full transition-all ${i === slide ? 'w-5 h-2 bg-indigo-400' : 'w-2 h-2 bg-slate-600'}`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {slide > 0 && (
            <button onClick={prev}
              className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 text-sm font-semibold hover:border-slate-500 transition-colors">
              ← Önceki
            </button>
          )}
          <button onClick={next}
            className="flex-1 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-bold transition-colors">
            {slide < SLIDES.length - 1 ? 'Sonraki →' : 'Başla!'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
