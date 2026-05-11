import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import Button from '../UI/Button';
import HowToPlay from '../Tutorial/HowToPlay';
import { generateDailyPoints, loadDailyResult, DAILY_MOVE_LIMIT } from '../../utils/daily';
import { DEFAULT_COLORS } from '../../utils/colors';

const THEME_META = {
  gece:  { label: 'Gece',  dot: '#818cf8' },
  buz:   { label: 'Buz',   dot: '#38bdf8' },
  alev:  { label: 'Alev',  dot: '#fb923c' },
  orman: { label: 'Orman', dot: '#34d399' },
  safak: { label: 'Şafak', dot: '#c084fc' },
};

function TrigonLogo({ size = 72 }) {
  const h = Math.round(size * 60 / 64);
  return (
    <svg viewBox="0 0 64 60" width={size} height={h} fill="none" aria-label="TRIGON logo">
      <defs>
        <linearGradient id="tgBg" x1="32" y1="4" x2="32" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#818cf8" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.25" />
        </linearGradient>
        <linearGradient id="tgScore" x1="32" y1="39" x2="32" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#818cf8" stopOpacity="0.60" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.85" />
        </linearGradient>
        <filter id="tgGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.8" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="tgDotGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <polygon points="32,4 6,56 58,56" fill="url(#tgBg)" />
      <polygon points="6,56 58,56 32,39" fill="url(#tgScore)" />
      <polygon points="32,4 6,56 58,56" stroke="#818cf8" strokeWidth="2.2" fill="none" strokeLinejoin="round" filter="url(#tgGlow)" />
      <line x1="32" y1="39" x2="32" y2="4"  stroke="#818cf8" strokeWidth="1.4" strokeOpacity="0.40" />
      <line x1="32" y1="39" x2="6"  y2="56" stroke="#818cf8" strokeWidth="1.4" strokeOpacity="0.40" />
      <line x1="32" y1="39" x2="58" y2="56" stroke="#818cf8" strokeWidth="1.4" strokeOpacity="0.40" />
      <circle cx="32" cy="4"  r="5" fill="#818cf8" filter="url(#tgDotGlow)" />
      <circle cx="6"  cy="56" r="5" fill="#818cf8" filter="url(#tgDotGlow)" />
      <circle cx="58" cy="56" r="5" fill="#818cf8" filter="url(#tgDotGlow)" />
      <circle cx="32" cy="39" r="3.8" fill="#c084fc" filter="url(#tgDotGlow)" />
    </svg>
  );
}

function MountainMini({ size = 18 }) {
  return (
    <svg viewBox="-1 -2 62 46" width={size} height={Math.round(size * 44 / 60)} fill="none">
      <path d="M 0,42 L 13,17 L 21,29 L 31,0 L 41,22 L 50,11 L 60,42 Z" fill="#C9A84C" fillOpacity="0.3" />
      <path d="M 0,42 L 13,17 L 21,29 L 31,0 L 41,22 L 50,11 L 60,42" stroke="#C9A84C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 26,8 L 31,0 L 36,8 L 31,6 Z" fill="white" opacity="0.9" />
    </svg>
  );
}

function AnimatedBg() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    function resize() { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const W = () => canvas.width, H = () => canvas.height;
    const pts = Array.from({ length: 9 }, () => ({
      x: 40 + Math.random() * (W() - 80), y: 40 + Math.random() * (H() - 80),
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
    }));
    const edges = [[0,1],[1,2],[2,3],[0,3],[3,4],[4,5],[1,5],[5,6],[6,7],[7,8],[0,8],[2,6],[4,8]];
    const tris  = [[0,1,3],[1,2,5],[3,4,8],[5,6,7]];
    let t = 0;
    function draw() {
      ctx.clearRect(0, 0, W(), H());
      t += 0.005;
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 30 || p.x > W() - 30) p.vx *= -1;
        if (p.y < 30 || p.y > H() - 30) p.vy *= -1;
      });
      edges.forEach(([a, b], i) => {
        ctx.beginPath();
        ctx.moveTo(pts[a].x, pts[a].y);
        ctx.lineTo(pts[b].x, pts[b].y);
        ctx.strokeStyle = `rgba(129,140,248,${0.10 + 0.07 * Math.sin(t + i * 0.5)})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });
      tris.forEach(([a, b, c], i) => {
        ctx.beginPath();
        ctx.moveTo(pts[a].x, pts[a].y);
        ctx.lineTo(pts[b].x, pts[b].y);
        ctx.lineTo(pts[c].x, pts[c].y);
        ctx.closePath();
        ctx.fillStyle = `rgba(129,140,248,${0.04 + 0.03 * Math.sin(t * 1.3 + i)})`;
        ctx.fill();
      });
      pts.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(129,140,248,0.3)';
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

const SECONDARY_ITEMS = [
  { label: 'İstatistikler', icon: '📊', action: 'stats'        },
  { label: 'Başarımlar',    icon: '🏆', action: 'achievements' },
  { label: 'Arkadaşlar',    icon: '👥', action: 'friends'      },
  { label: 'Profil',        icon: '👤', action: 'profile'      },
];

export default function MainMenu() {
  const { goTo, theme, cycleTheme, startGame, profile } = useApp();
  const [showTutorial, setShowTutorial] = useState(false);
  const dailyResult = loadDailyResult();
  const tm = THEME_META[theme];

  function handleDaily() {
    const points = generateDailyPoints();
    startGame({
      mode: 'daily',
      layout: 'random',
      points,
      moveLimit: DAILY_MOVE_LIMIT,
      playerNames: { 1: profile?.name ?? 'Oyuncu', 2: '' },
      playerColors: DEFAULT_COLORS,
    });
  }

  return (
    <div className="full-screen relative flex flex-col items-center justify-center overflow-hidden px-4">
      <AnimatedBg />

      {/* Nasıl Oynanır */}
      <button
        onClick={() => setShowTutorial(true)}
        className="absolute top-4 left-4 z-10 text-xs text-slate-600 hover:text-slate-400 transition-colors glass rounded-full px-3 py-1.5"
      >
        ? Nasıl Oynanır
      </button>

      {/* Tema toggle */}
      <button
        onClick={cycleTheme}
        className="absolute top-4 right-4 z-10 flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors glass rounded-full px-3 py-1.5"
      >
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: tm.dot }} />
        {tm.label}
      </button>

      <motion.div
        className="relative z-10 flex flex-col items-center gap-5 w-full max-w-xs"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      >
        {/* Logo + başlık */}
        <div className="text-center">
          <motion.div
            className="flex justify-center mb-4"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <TrigonLogo size={84} />
          </motion.div>
          <h1 className="text-5xl sm:text-6xl font-black tracking-[0.08em] leading-none">
            <span className="text-white">TRI</span><span className="text-indigo-400">GON</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-2">
            Çizgileri bağla · Üçgenleri kapat · Puan kazan
          </p>
        </div>

        {/* Birincil butonlar */}
        <div className="flex flex-col gap-3 w-full">
          {[
            { label: 'Oyna',        icon: '▶',  action: 'setup',  variant: 'primary'   },
            { label: 'Online Oyna', icon: '🌐', action: 'online', variant: 'secondary' },
          ].map((item, i) => (
            <motion.div
              key={item.action}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.07 }}
            >
              <Button onClick={() => goTo(item.action)} variant={item.variant} size="lg" className="w-full">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Button>
            </motion.div>
          ))}

          {/* Günlük bulmaca */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.34 }}>
            <button
              onClick={handleDaily}
              className="w-full glass rounded-2xl border-2 transition-all flex items-center justify-between px-5 py-3.5 border-amber-500/30 hover:border-amber-400/60 hover:bg-amber-500/5 active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">📅</span>
                <div className="text-left">
                  <div className="text-sm font-bold text-white">Günlük Bulmaca</div>
                  <div className="text-xs text-slate-500">Her gün yeni harita</div>
                </div>
              </div>
              {dailyResult ? (
                <div className="text-right">
                  <div className="text-xs text-amber-400 font-bold">{dailyResult.score} 🔺</div>
                  <div className="text-[10px] text-slate-600">Tamamlandı ✓</div>
                </div>
              ) : (
                <span className="text-xs font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/30 rounded-full px-2 py-0.5">Yeni</span>
              )}
            </button>
          </motion.div>
        </div>

        {/* İkincil 2×2 ızgara */}
        <div className="grid grid-cols-2 gap-2 w-full">
          {SECONDARY_ITEMS.map((item, i) => (
            <motion.button
              key={item.action}
              onClick={() => goTo(item.action)}
              className="glass rounded-xl border border-slate-700/40 hover:border-slate-600 active:scale-95 transition-all py-3 px-4 flex items-center gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42 + i * 0.05 }}
            >
              <span className="text-base">{item.icon}</span>
              <span className="text-sm text-slate-300 font-medium">{item.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Altay Interactive marka */}
        <motion.div
          className="flex items-center gap-2 opacity-35"
          initial={{ opacity: 0 }} animate={{ opacity: 0.35 }} transition={{ delay: 0.7 }}
        >
          <MountainMini size={14} />
          <span className="text-[11px] text-slate-400 tracking-[0.25em] font-medium">ALTAY INTERACTIVE</span>
        </motion.div>
      </motion.div>

      {/* HowToPlay modal */}
      <AnimatePresence>
        {showTutorial && <HowToPlay onClose={() => setShowTutorial(false)} />}
      </AnimatePresence>
    </div>
  );
}
