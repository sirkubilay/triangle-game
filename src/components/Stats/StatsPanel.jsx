import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';

function fmt(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

function WinBar({ wins, played, color = '#34d399' }) {
  const rate = played > 0 ? Math.round((wins / played) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-500">{wins} galibiyet / {played} oyun</span>
        <span className="font-bold" style={{ color }}>{rate}%</span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ background: color }}
          initial={{ width: 0 }} animate={{ width: `${rate}%` }} transition={{ delay: 0.2, duration: 0.5 }} />
      </div>
    </div>
  );
}

function BigStat({ value, label, color = 'text-white', sub }) {
  return (
    <div className="glass rounded-2xl p-4 text-center border border-slate-700/50">
      <div className={`text-3xl font-black ${color}`}>{value ?? 0}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
      {sub && <div className="text-[10px] text-slate-700 mt-0.5">{sub}</div>}
    </div>
  );
}

function HighScoreBadge({ score, date, label = 'Rekor', color = '#fbbf24' }) {
  if (!score) return null;
  return (
    <div className="glass rounded-2xl p-4 border flex items-center gap-4" style={{ borderColor: `${color}33` }}>
      <div className="text-3xl">🏅</div>
      <div className="flex-1">
        <div className="text-xs text-slate-500 mb-0.5">{label}</div>
        <div className="text-2xl font-black" style={{ color }}>{score}</div>
        <div className="text-xs text-slate-700">{fmt(date)}</div>
      </div>
    </div>
  );
}

function HistoryRow({ g }) {
  const icons = { win: '🏆', loss: '💀', draw: '🤝' };
  const modeLabel = {
    '1v1': '1v1', vsAI: `AI · ${g.difficulty ?? ''}`,
    timeAttack: '⚡ Zaman', daily: '📅 Günlük', online: '🌐 Online',
  };
  return (
    <div className="glass rounded-xl px-4 py-2.5 flex items-center justify-between border border-slate-700/30">
      <div className="flex items-center gap-3">
        <span className="text-base">{icons[g.outcome] ?? '•'}</span>
        <div>
          <div className="text-xs font-semibold text-white">
            {g.outcome === 'win' ? 'Kazandın' : g.outcome === 'loss' ? 'Kaybettin' : 'Berabere'}
          </div>
          <div className="text-xs text-slate-600">{modeLabel[g.mode] ?? g.mode}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-bold text-slate-300">{g.scores?.player} – {g.scores?.opponent}</div>
        <div className="text-[10px] text-slate-700">{fmt(g.date)}</div>
      </div>
    </div>
  );
}

function Empty({ text }) {
  return (
    <div className="text-center py-12 text-slate-700">
      <div className="text-3xl mb-2">📭</div>
      <p className="text-sm">{text}</p>
    </div>
  );
}

// ── Sekmeler ─────────────────────────────────────────────────

function TabGenel({ stats }) {
  const h = stats.history ?? [];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <BigStat value={stats.totalGames}     label="Toplam Oyun" />
        <BigStat value={stats.totalTriangles} label="Toplam Üçgen" color="text-amber-400" />
        <BigStat value={stats.wins}           label="Galibiyet"   color="text-emerald-400" />
        <BigStat value={stats.losses}         label="Mağlubiyet"  color="text-rose-400" />
      </div>
      <div className="glass rounded-2xl p-4 border border-slate-700/50">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Genel Kazanma Oranı</p>
        <WinBar wins={stats.wins} played={stats.totalGames - (stats.draws ?? 0)} />
      </div>
      {h.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Son Oyunlar</p>
          <div className="space-y-2">
            {h.slice(0, 8).map((g, i) => <HistoryRow key={i} g={g} />)}
          </div>
        </div>
      )}
      {stats.totalGames === 0 && <Empty text="Henüz oyun oynamadın." />}
    </div>
  );
}

function Tab1v1({ m }) {
  const s = m['1v1'] ?? {};
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <BigStat value={s.played}  label="Oyun" />
        <BigStat value={s.wins}    label="Galibiyet"  color="text-emerald-400" />
        <BigStat value={s.losses}  label="Mağlubiyet" color="text-rose-400" />
      </div>
      {(s.played ?? 0) > 0 && (
        <div className="glass rounded-2xl p-4 border border-slate-700/50">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Kazanma Oranı</p>
          <WinBar wins={s.wins ?? 0} played={(s.played ?? 0) - (s.draws ?? 0)} />
        </div>
      )}
      <HighScoreBadge score={s.highScore} date={s.highScoreDate} label="En Yüksek Skor (galibiyet)" />
      {(s.played ?? 0) > 0 && (
        <div className="glass rounded-2xl p-4 border border-slate-700/50">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Detay</p>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div><div className="text-2xl font-black text-emerald-400">{s.wins ?? 0}</div><div className="text-slate-600">Galibiyet</div></div>
            <div><div className="text-2xl font-black text-slate-400">{s.draws ?? 0}</div><div className="text-slate-600">Berabere</div></div>
            <div><div className="text-2xl font-black text-rose-400">{s.losses ?? 0}</div><div className="text-slate-600">Mağlubiyet</div></div>
          </div>
        </div>
      )}
      {(s.played ?? 0) === 0 && <Empty text="Henüz 1v1 oyun oynamadın." />}
    </div>
  );
}

function TabVsAI({ m }) {
  const s = m.vsAI ?? {};
  const diffs = [
    { id: 'easy',   label: 'Kolay', icon: '😊', color: '#34d399' },
    { id: 'medium', label: 'Orta',  icon: '🧠', color: '#fbbf24' },
    { id: 'hard',   label: 'Zor',   icon: '🔥', color: '#f87171' },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <BigStat value={s.played ?? 0} label="Toplam Oyun" />
        <BigStat value={s.wins ?? 0}   label="Galibiyet"   color="text-emerald-400" />
      </div>
      <HighScoreBadge score={s.highScore} date={s.highScoreDate} label="En Yüksek Skor" color="#818cf8" />
      <div className="glass rounded-2xl p-4 border border-slate-700/50">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Zorluk Bazlı</p>
        <div className="space-y-4">
          {diffs.map(d => {
            const bd = s.byDifficulty?.[d.id] ?? { played: 0, wins: 0 };
            return (
              <div key={d.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1.5 text-sm">
                    <span>{d.icon}</span>
                    <span className="text-slate-300 font-medium">{d.label}</span>
                  </span>
                  <span className="text-xs text-slate-500">{bd.wins}G / {bd.played} oyun</span>
                </div>
                <WinBar wins={bd.wins} played={bd.played} color={d.color} />
              </div>
            );
          })}
        </div>
      </div>
      {(s.played ?? 0) === 0 && <Empty text="Henüz AI'ya karşı oynamadın." />}
    </div>
  );
}

function TabTimeAttack({ m }) {
  const s = m.timeAttack ?? {};
  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-6 border border-amber-500/20 text-center">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">En Yüksek Skor</div>
        <div className="text-6xl font-black text-amber-400 mb-1">{s.highScore ?? 0}</div>
        <div className="text-xs text-slate-600">üçgen · {fmt(s.highScoreDate)}</div>
      </div>
      <BigStat value={s.played ?? 0} label="Toplam Oyun" />
      <div className="glass rounded-2xl p-4 border border-slate-700/50">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Hedefler</p>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          {[
            { goal: 5,  label: 'Başlangıç' },
            { goal: 10, label: 'İyi'        },
            { goal: 15, label: 'Uzman'      },
          ].map(g => (
            <div key={g.goal} className={`rounded-xl py-2 border ${
              (s.highScore ?? 0) >= g.goal
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                : 'border-slate-700/30 text-slate-700'
            }`}>
              <div className="font-black text-lg">{g.goal}+</div>
              <div className="text-[10px] mt-0.5">{g.label}</div>
            </div>
          ))}
        </div>
      </div>
      {(s.played ?? 0) === 0 && <Empty text="Henüz Zaman Saldırısı oynamadın." />}
    </div>
  );
}

function TabDaily({ m }) {
  const s    = m.daily ?? {};
  const STAR = ['', '⭐', '⭐⭐', '⭐⭐⭐'];
  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-6 border border-amber-500/20 text-center">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">En İyi Günlük Skor</div>
        <div className="text-6xl font-black text-amber-400 mb-1">{s.bestScore ?? 0}</div>
        <div className="text-2xl mb-1">{STAR[s.bestStars ?? 0] ?? ''}</div>
        <div className="text-xs text-slate-600">{fmt(s.bestScoreDate)}</div>
      </div>
      <BigStat value={s.played ?? 0} label="Oynanan Bulmaca" />
      <div className="glass rounded-2xl p-4 border border-slate-700/50">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Yıldız Eşikleri</p>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          {[{ min: 1, tier: 1 }, { min: 3, tier: 2 }, { min: 6, tier: 3 }].map(t => (
            <div key={t.tier} className={`rounded-xl py-2 border ${
              (s.bestScore ?? 0) >= t.min
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                : 'border-slate-700/30 text-slate-700'
            }`}>
              <div>{STAR[t.tier]}</div>
              <div className="text-[10px] mt-0.5">{t.min}+ üçgen</div>
            </div>
          ))}
        </div>
      </div>
      {(s.played ?? 0) === 0 && <Empty text="Henüz Günlük Bulmaca oynamadın." />}
    </div>
  );
}

function TabOnline({ m }) {
  const s = m.online ?? {};
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <BigStat value={s.played  ?? 0} label="Oyun" />
        <BigStat value={s.wins    ?? 0} label="Galibiyet"  color="text-emerald-400" />
        <BigStat value={s.losses  ?? 0} label="Mağlubiyet" color="text-rose-400" />
      </div>
      {(s.played ?? 0) > 0 && (
        <div className="glass rounded-2xl p-4 border border-slate-700/50">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Kazanma Oranı</p>
          <WinBar wins={s.wins ?? 0} played={(s.played ?? 0) - (s.draws ?? 0)} color="#818cf8" />
        </div>
      )}
      {(s.played ?? 0) === 0 && <Empty text="Henüz online oyun oynamadın." />}
    </div>
  );
}

// ── Ana bileşen ───────────────────────────────────────────────

const TABS = [
  { id: 'genel',      label: 'Genel'      },
  { id: '1v1',        label: '1v1'        },
  { id: 'vsai',       label: 'vs AI'      },
  { id: 'timeattack', label: '⚡ Zaman'  },
  { id: 'daily',      label: '📅 Günlük' },
  { id: 'online',     label: '🌐 Online' },
];

export default function StatsPanel() {
  const { goToMenu, stats } = useApp();
  const [tab, setTab] = useState('genel');
  const m = stats.modes ?? {};

  return (
    <div className="full-screen flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--c-bg)' }}>

      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-slate-800 shrink-0">
        <button onClick={goToMenu} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">←</button>
        <h1 className="text-xl font-black text-white">İstatistikler</h1>
      </div>

      <div className="flex gap-1 px-3 pt-3 pb-1 overflow-x-auto shrink-0" style={{ scrollbarWidth: 'none' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tab === t.id
                ? 'bg-indigo-500 text-white'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <AnimatePresence mode="wait">
          <motion.div key={tab}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}>
            {tab === 'genel'      && <TabGenel      stats={stats} />}
            {tab === '1v1'        && <Tab1v1        m={m} />}
            {tab === 'vsai'       && <TabVsAI       m={m} />}
            {tab === 'timeattack' && <TabTimeAttack m={m} />}
            {tab === 'daily'      && <TabDaily      m={m} />}
            {tab === 'online'     && <TabOnline     m={m} />}
          </motion.div>
        </AnimatePresence>
        <div className="h-6" />
      </div>
    </div>
  );
}
