import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { EMOJIS, saveProfile } from '../../utils/profile';
import { COLOR_OPTIONS } from '../../utils/colors';
import Button from '../UI/Button';

export default function ProfilePanel() {
  const { goToMenu, profile, setProfile, stats } = useApp();
  const [name, setName]   = useState(profile.name);
  const [emoji, setEmoji] = useState(profile.emoji);
  const [color, setColor] = useState(profile.color);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    const p = { name: name.trim() || 'Oyuncu', emoji, color };
    setProfile(p);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="full-screen overflow-y-auto" style={{ backgroundColor: 'var(--c-bg)' }}>
      <motion.div
        className="w-full max-w-md mx-auto px-4 py-6"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      >
        <button onClick={goToMenu} className="text-slate-500 active:text-slate-300 mb-5 flex items-center gap-1 text-sm py-1">
          ← Geri
        </button>

        <h2 className="text-2xl font-black text-white mb-6">Profil</h2>

        {/* Preview */}
        <div className="glass rounded-2xl p-5 mb-6 flex items-center gap-4 border border-slate-700/50">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
            style={{ background: `${color}22`, border: `2px solid ${color}55` }}>
            {emoji}
          </div>
          <div>
            <div className="text-lg font-bold text-white">{name || 'Oyuncu'}</div>
            <div className="text-xs text-slate-500 mt-0.5">{stats.totalGames} oyun · {stats.wins} galibiyet</div>
          </div>
        </div>

        {/* Name */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">İsim</label>
          <input
            className="w-full glass rounded-xl px-4 py-2.5 text-sm text-white border border-slate-700 focus:border-indigo-500 outline-none bg-transparent placeholder-slate-600"
            placeholder="Oyuncu ismi"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={16}
          />
        </div>

        {/* Emoji */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Emoji</label>
          <div className="grid grid-cols-6 gap-2">
            {EMOJIS.map(em => (
              <button key={em} onClick={() => setEmoji(em)}
                className={`h-11 rounded-xl text-2xl transition-all border-2 ${emoji === em ? 'border-indigo-500 bg-indigo-500/15 scale-110' : 'border-transparent bg-slate-800 hover:border-slate-600'}`}>
                {em}
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Renk</label>
          <div className="flex flex-wrap gap-3">
            {COLOR_OPTIONS.map(c => (
              <button key={c.id} onClick={() => setColor(c.hex)} title={c.name}
                className={`w-9 h-9 rounded-full border-2 transition-all ${color === c.hex ? 'border-white scale-110' : 'border-transparent opacity-70 hover:opacity-100'}`}
                style={{ background: c.hex }} />
            ))}
          </div>
        </div>

        {/* Stats summary */}
        <div className="glass rounded-2xl p-4 mb-6 border border-slate-700/40">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">İstatistikler</div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-2xl font-black text-white">{stats.totalGames}</div>
              <div className="text-xs text-slate-600">Oyun</div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-400">{stats.wins}</div>
              <div className="text-xs text-slate-600">Galibiyet</div>
            </div>
            <div>
              <div className="text-2xl font-black text-amber-400">{stats.totalTriangles}</div>
              <div className="text-xs text-slate-600">Üçgen</div>
            </div>
          </div>
        </div>

        <Button onClick={handleSave} variant="primary" size="lg" className="w-full">
          {saved ? '✓ Kaydedildi' : 'Kaydet'}
        </Button>
        <div className="h-8" />
      </motion.div>
    </div>
  );
}
