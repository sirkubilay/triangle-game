import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import Button from '../UI/Button';
import { COLOR_OPTIONS, DEFAULT_COLORS } from '../../utils/colors';

const DIFFICULTIES = [
  { id: 'easy',   label: 'Kolay', icon: '😊', desc: 'Rastgele hamle yapar' },
  { id: 'medium', label: 'Orta',  icon: '🧠', desc: 'Üçgen kapatmaya çalışır' },
  { id: 'hard',   label: 'Zor',   icon: '🔥', desc: 'Stratejik oynar, zor alt edilir' },
];

const POINT_OPTIONS = [10, 14, 18];

function ColorRow({ label, selected, onSelect, exclude }) {
  return (
    <div>
      <div className="text-xs text-slate-600 mb-1.5">{label}</div>
      <div className="flex flex-wrap gap-2">
        {COLOR_OPTIONS.filter(c => c.hex !== exclude).map(c => (
          <button
            key={c.id}
            onClick={() => onSelect(c.hex)}
            title={c.name}
            className={`w-7 h-7 rounded-full border-2 transition-all ${selected === c.hex ? 'border-white scale-110' : 'border-transparent opacity-70 hover:opacity-100'}`}
            style={{ background: c.hex }}
          />
        ))}
      </div>
    </div>
  );
}

export default function GameSetup() {
  const { goToMenu, startGame, friends } = useApp();
  const [mode, setMode]         = useState(null);
  const [difficulty, setDiff]   = useState('medium');
  const [pointCount, setPoints] = useState(10);
  const [p1Name, setP1Name]     = useState('Oyuncu 1');
  const [p2Name, setP2Name]     = useState('Oyuncu 2');
  const [selectedFriend, setFriend] = useState(null);
  const [p1Color, setP1Color]   = useState(DEFAULT_COLORS[1]);
  const [p2Color, setP2Color]   = useState(DEFAULT_COLORS[2]);

  function handleFriendSelect(f) { setFriend(f); setP2Name(f.name); }

  function handleStart() {
    startGame({
      mode,
      difficulty: mode === 'vsAI' ? difficulty : null,
      pointCount,
      playerNames: {
        1: p1Name.trim() || 'Oyuncu 1',
        2: mode === 'vsAI' ? 'Bilgisayar' : (p2Name.trim() || 'Oyuncu 2'),
      },
      playerColors: { 1: p1Color, 2: p2Color },
      friendId: selectedFriend?.id ?? null,
    });
  }

  return (
    <div className="full-screen overflow-y-auto bg-slate-900">
      <motion.div
        className="w-full max-w-md mx-auto px-4 py-6"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      >
        <button onClick={goToMenu} className="text-slate-500 active:text-slate-300 mb-5 flex items-center gap-1 text-sm py-1">
          ← Geri
        </button>
        <h2 className="text-2xl font-black text-white mb-5">Oyun Kurulumu</h2>

        {/* Mod */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">Oyun Modu</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: '1v1',  label: '2 Oyuncu',    icon: '👥', desc: 'Aynı cihazda' },
              { id: 'vsAI', label: 'Bilgisayar',  icon: '🤖', desc: "AI'ya karşı oyna" },
            ].map(m => (
              <button key={m.id} onClick={() => setMode(m.id)}
                className={`glass rounded-2xl p-4 border-2 text-left transition-all ${mode === m.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-transparent hover:border-slate-600'}`}>
                <div className="text-2xl mb-1">{m.icon}</div>
                <div className="text-sm font-bold text-white">{m.label}</div>
                <div className="text-xs text-slate-500">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Zorluk */}
        {mode === 'vsAI' && (
          <motion.div className="mb-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">Zorluk</label>
            <div className="flex gap-2">
              {DIFFICULTIES.map(d => (
                <button key={d.id} onClick={() => setDiff(d.id)} title={d.desc}
                  className={`flex-1 glass rounded-xl p-3 border-2 text-center transition-all ${difficulty === d.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-transparent hover:border-slate-600'}`}>
                  <div className="text-xl mb-1">{d.icon}</div>
                  <div className="text-xs font-semibold text-white">{d.label}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-600 mt-1.5 text-center">{DIFFICULTIES.find(d => d.id === difficulty)?.desc}</p>
          </motion.div>
        )}

        {/* İsimler */}
        {mode && (
          <motion.div className="mb-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">Oyuncu Adları</label>
            <div className="space-y-2">
              <input className="w-full glass rounded-xl px-4 py-2.5 text-sm text-white border border-slate-700 focus:border-indigo-500 outline-none bg-transparent placeholder-slate-600"
                placeholder="Oyuncu 1" value={p1Name} onChange={e => setP1Name(e.target.value)} maxLength={16} />
              {mode === '1v1' && (
                <>
                  <input className="w-full glass rounded-xl px-4 py-2.5 text-sm text-white border border-slate-700 focus:border-rose-500 outline-none bg-transparent placeholder-slate-600"
                    placeholder="Oyuncu 2" value={p2Name} onChange={e => { setP2Name(e.target.value); setFriend(null); }} maxLength={16} />
                  {friends.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-600 mb-1.5">Arkadaşlardan seç:</p>
                      <div className="flex flex-wrap gap-2">
                        {friends.map(f => (
                          <button key={f.id} onClick={() => handleFriendSelect(f)}
                            className={`text-xs px-3 py-1 rounded-full border transition-all ${selectedFriend?.id === f.id ? 'border-rose-400 bg-rose-500/15 text-rose-300' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                            {f.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* Renk Seçimi */}
        {mode && (
          <motion.div className="mb-5 glass rounded-2xl p-4 border border-slate-700/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">🎨 Renk Seçimi</label>
            <div className="space-y-3">
              <ColorRow
                label={`${p1Name || 'Oyuncu 1'} rengi`}
                selected={p1Color} onSelect={setP1Color} exclude={p2Color}
              />
              <ColorRow
                label={`${mode === 'vsAI' ? 'Bilgisayar' : (p2Name || 'Oyuncu 2')} rengi`}
                selected={p2Color} onSelect={setP2Color} exclude={p1Color}
              />
            </div>
            {/* Önizleme */}
            <div className="flex gap-2 mt-3">
              <div className="flex-1 h-1.5 rounded-full" style={{ background: p1Color }} />
              <div className="flex-1 h-1.5 rounded-full" style={{ background: p2Color }} />
            </div>
          </motion.div>
        )}

        {/* Nokta sayısı */}
        {mode && (
          <motion.div className="mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">
              Nokta Sayısı
            </label>
            <div className="flex gap-2">
              {POINT_OPTIONS.map(n => (
                <button key={n} onClick={() => setPoints(n)}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${pointCount === n ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                  {n}
                  <div className="text-xs font-normal text-slate-600">{n === 10 ? 'Normal' : n === 14 ? 'Uzun' : 'Epik'}</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <Button onClick={handleStart} variant="primary" size="lg" disabled={!mode} className="w-full">
          🎮 Oyunu Başlat
        </Button>
        <div className="h-8" />
      </motion.div>
    </div>
  );
}
