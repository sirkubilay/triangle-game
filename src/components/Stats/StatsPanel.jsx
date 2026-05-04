import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import Button from '../UI/Button';

function StatCard({ label, value, color = 'text-white', sub }) {
  return (
    <div className="glass rounded-2xl p-4 text-center border border-slate-700/50">
      <div className={`text-3xl font-black ${color} mb-1`}>{value}</div>
      <div className="text-xs text-slate-500 font-medium">{label}</div>
      {sub && <div className="text-xs text-slate-600 mt-0.5">{sub}</div>}
    </div>
  );
}

function WinRate({ wins, total }) {
  const rate = total > 0 ? Math.round((wins / total) * 100) : 0;
  return (
    <div className="glass rounded-2xl p-4 border border-slate-700/50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Kazanma Oranı</span>
        <span className="text-lg font-black text-emerald-400">{rate}%</span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-emerald-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${rate}%` }}
          transition={{ delay: 0.3, duration: 0.6 }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-600 mt-1">
        <span>{wins} galibiyet</span>
        <span>{total} oyun</span>
      </div>
    </div>
  );
}

export default function StatsPanel() {
  const { goToMenu, stats } = useApp();

  const history = stats.history ?? [];

  return (
    <div className="full-screen flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-slate-800">
        <button onClick={goToMenu} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
          ←
        </button>
        <h1 className="text-xl font-black text-white">İstatistikler</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Main stats grid */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Toplam Oyun"  value={stats.totalGames}   color="text-white" />
          <StatCard label="Galibiyet"    value={stats.wins}         color="text-emerald-400" />
          <StatCard label="Mağlubiyet"   value={stats.losses}       color="text-rose-400" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Berabere"       value={stats.draws}         color="text-slate-400" />
          <StatCard label="Toplam Üçgen"   value={stats.totalTriangles} color="text-amber-400" sub="tüm oyunlarda" />
        </div>

        {/* Win rate */}
        <WinRate wins={stats.wins} total={stats.totalGames} />

        {/* AI wins */}
        {(stats.vsAIWins?.easy || stats.vsAIWins?.medium || stats.vsAIWins?.hard) ? (
          <div className="glass rounded-2xl p-4 border border-slate-700/50">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Bilgisayara Karşı Galibiyet</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'easy',   label: 'Kolay', icon: '😊', color: 'text-emerald-400' },
                { id: 'medium', label: 'Orta',  icon: '🧠', color: 'text-amber-400' },
                { id: 'hard',   label: 'Zor',   icon: '🔥', color: 'text-rose-400' },
              ].map(d => (
                <div key={d.id} className="text-center">
                  <div className="text-lg mb-0.5">{d.icon}</div>
                  <div className={`text-2xl font-black ${d.color}`}>{stats.vsAIWins?.[d.id] ?? 0}</div>
                  <div className="text-xs text-slate-600">{d.label}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Recent games */}
        {history.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Son Oyunlar</h3>
            <div className="space-y-2">
              {history.slice(0, 10).map((g, i) => (
                <div key={i} className="glass rounded-xl px-4 py-2.5 flex items-center justify-between border border-slate-700/30">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      {g.outcome === 'win' ? '🏆' : g.outcome === 'loss' ? '💀' : '🤝'}
                    </span>
                    <div>
                      <div className="text-xs font-semibold text-white capitalize">
                        {g.outcome === 'win' ? 'Kazandın' : g.outcome === 'loss' ? 'Kaybettin' : 'Berabere'}
                      </div>
                      <div className="text-xs text-slate-600">
                        {g.vsAI ? `vs AI (${g.difficulty})` : `${g.playerNames?.[1]} vs ${g.playerNames?.[2]}`}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-slate-400">
                    {g.scores?.player} – {g.scores?.opponent}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats.totalGames === 0 && (
          <div className="text-center py-12 text-slate-600">
            <div className="text-4xl mb-3">📊</div>
            <p className="text-sm">Henüz oyun oynamadın.</p>
            <p className="text-xs mt-1">Oyun oynayınca istatistiklerin burada görünecek.</p>
          </div>
        )}
      </div>
    </div>
  );
}
