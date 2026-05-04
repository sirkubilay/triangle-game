import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import Button from '../UI/Button';

function AnimatedBg() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;

    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();

    // Duyarlı boyutlandırma
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const W = () => canvas.width;
    const H = () => canvas.height;

    const pts = Array.from({ length: 9 }, () => ({
      x: 40 + Math.random() * (W() - 80),
      y: 40 + Math.random() * (H() - 80),
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
    }));

    const edges  = [[0,1],[1,2],[2,3],[0,3],[3,4],[4,5],[1,5],[5,6],[6,7],[7,8],[0,8],[2,6],[4,8]];
    const tris   = [[0,1,3],[1,2,5],[3,4,8],[5,6,7]];
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

const menuItems = [
  { label: 'Oyna',         icon: '▶',  action: 'setup',   variant: 'primary' },
  { label: 'Online Oyna',  icon: '🌐', action: 'online',  variant: 'secondary' },
  { label: 'İstatistikler',icon: '📊', action: 'stats',   variant: 'ghost' },
  { label: 'Arkadaşlar',   icon: '👥', action: 'friends', variant: 'ghost' },
];

export default function MainMenu() {
  const { goTo } = useApp();

  return (
    <div className="full-screen relative flex flex-col items-center justify-center overflow-hidden px-4">
      <AnimatedBg />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-6 sm:gap-8 w-full max-w-xs"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      >
        {/* Logo */}
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <svg width="56" height="50" viewBox="0 0 64 56" fill="none">
              <polygon points="32,4 60,52 4,52"  fill="rgba(129,140,248,0.15)" stroke="#818cf8" strokeWidth="2" />
              <polygon points="22,16 48,52 4,52" fill="rgba(251,113,133,0.12)" stroke="#fb7185" strokeWidth="1.5" />
              <circle cx="32" cy="4"  r="4" fill="#818cf8" />
              <circle cx="60" cy="52" r="4" fill="#818cf8" />
              <circle cx="4"  cy="52" r="4" fill="#818cf8" />
              <circle cx="22" cy="16" r="3" fill="#fb7185" />
              <circle cx="48" cy="52" r="3" fill="#fb7185" />
            </svg>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Üçgen<span className="text-indigo-400">Bağlantı</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1.5">
            Çizgileri bağla, üçgenleri kapat, puan kazan
          </p>
        </div>

        {/* Butonlar */}
        <div className="flex flex-col gap-3 w-full">
          {menuItems.map((item, i) => (
            <motion.div
              key={item.action}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.07 }}
            >
              <Button onClick={() => goTo(item.action)} variant={item.variant} size="lg" className="w-full">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Button>
            </motion.div>
          ))}
        </div>

        <p className="text-slate-700 text-xs">v1.0</p>
      </motion.div>
    </div>
  );
}
