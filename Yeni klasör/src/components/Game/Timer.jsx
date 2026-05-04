import { motion } from 'framer-motion';

const TOTAL = 30;
const R = 18, CX = 22, CY = 22, CIRCUMFERENCE = 2 * Math.PI * R;

export default function Timer({ timeLeft }) {
  const progress = timeLeft / TOTAL;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  const color = timeLeft > 15 ? '#34d399' : timeLeft > 8 ? '#fbbf24' : '#f87171';
  const pulse = timeLeft <= 8;

  return (
    <div className={`flex items-center gap-1.5 ${pulse ? 'pulse-glow' : ''}`}>
      <svg width={44} height={44} viewBox="0 0 44 44">
        {/* Arka plan halkası */}
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#1e293b" strokeWidth={3.5} />
        {/* İlerleme halkası */}
        <motion.circle
          cx={CX} cy={CY} r={R}
          fill="none" stroke={color} strokeWidth={3.5}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${CX} ${CY})`}
          animate={{ stroke: color }}
          transition={{ duration: 0.3 }}
        />
        {/* Sayı */}
        <text x={CX} y={CY + 5} textAnchor="middle" fontSize="12" fontWeight="700" fill={color}>
          {timeLeft}
        </text>
      </svg>
    </div>
  );
}
