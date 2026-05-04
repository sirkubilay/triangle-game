export default function Button({ children, onClick, variant = 'primary', size = 'md', disabled, className = '' }) {
  const base = 'font-semibold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2';

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const variants = {
    primary:   'bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/30',
    secondary: 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40',
    danger:    'bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/30',
    ghost:     'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10',
    green:     'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/30',
    outline:   'bg-transparent border-2 border-indigo-400 text-indigo-300 hover:bg-indigo-500/10',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
