import { useEffect, useState } from 'react';

const GOLD  = '#C9A84C';
const WHITE = '#F8FAFC';

export default function SplashScreen({ onDone }) {
  const [exit, setExit] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setExit(true), 2100);
    const t2 = setTimeout(onDone, 2700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div className={`splash-overlay${exit ? ' splash-exit' : ''}`}>
      <svg viewBox="0 0 200 200" width="260" height="260" fill="none">
        <defs>
          <linearGradient id="mtG" x1="100" y1="25" x2="100" y2="125" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor={GOLD}    stopOpacity="0.55" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0"    />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer circle — draws last, encloses everything */}
        <circle
          className="logo-circle"
          cx="100" cy="100" r="88"
          stroke={GOLD} strokeWidth="1.5"
          transform="rotate(-90 100 100)"
          filter="url(#glow)"
        />

        {/* Mountain gradient fill */}
        <path
          className="mt-fill"
          d="M 33,123 L 61,67 L 80,92 L 103,28 L 125,78 L 145,53 L 167,123 Z"
          fill="url(#mtG)"
        />

        {/* Mountain outline — draws first */}
        <path
          className="mt-outline"
          d="M 33,123 L 61,67 L 80,92 L 103,28 L 125,78 L 145,53 L 167,123"
          stroke={GOLD} strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round"
          filter="url(#glow)"
        />

        {/* Snow — main peak */}
        <path className="mt-snow" fill={WHITE}
          d="M 94,53 L 103,28 L 111,53 L 103,47 Z" />

        {/* Snow — right peak */}
        <path className="mt-snow" fill={WHITE}
          d="M 139,65 L 145,53 L 150,65 L 145,61 Z" />

        {/* Divider line */}
        <line className="logo-divider"
          x1="55" y1="132" x2="145" y2="132"
          stroke={GOLD} strokeWidth="0.8" strokeOpacity="0.45"
        />

        {/* ALTAY */}
        <text
          className="logo-text-main"
          x="100" y="153" textAnchor="middle" fill={WHITE}
          style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", fontSize: '21px', fontWeight: 700, letterSpacing: '5px' }}
        >ALTAY</text>

        {/* INTERACTIVE */}
        <text
          className="logo-text-sub"
          x="100" y="170" textAnchor="middle" fill={GOLD}
          style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", fontSize: '9px', fontWeight: 500, letterSpacing: '3.5px' }}
        >INTERACTIVE</text>
      </svg>
    </div>
  );
}
