import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import Button from '../UI/Button';

function FriendCard({ friend, onRemove, onPlay }) {
  const total = (friend.wins || 0) + (friend.losses || 0) + (friend.draws || 0);
  const winRate = total > 0 ? Math.round((friend.wins / total) * 100) : 0;

  return (
    <motion.div
      className="glass rounded-2xl p-4 border border-slate-700/40"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      layout
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-lg">
            {friend.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-white">{friend.name}</div>
            <div className="text-xs text-slate-600">
              {new Date(friend.addedAt).toLocaleDateString('tr-TR')} eklendi
            </div>
          </div>
        </div>
        <button
          onClick={() => onRemove(friend.id)}
          className="text-slate-600 hover:text-rose-400 text-xs transition-colors px-2"
        >
          ✕
        </button>
      </div>

      {total > 0 && (
        <div className="flex gap-3 mb-3 text-center">
          <div className="flex-1">
            <div className="text-emerald-400 font-black text-lg">{friend.wins || 0}</div>
            <div className="text-xs text-slate-600">Galibiyet</div>
          </div>
          <div className="flex-1">
            <div className="text-rose-400 font-black text-lg">{friend.losses || 0}</div>
            <div className="text-xs text-slate-600">Mağlubiyet</div>
          </div>
          <div className="flex-1">
            <div className="text-slate-400 font-black text-lg">{friend.draws || 0}</div>
            <div className="text-xs text-slate-600">Berabere</div>
          </div>
          <div className="flex-1">
            <div className="text-amber-400 font-black text-lg">{winRate}%</div>
            <div className="text-xs text-slate-600">Oran</div>
          </div>
        </div>
      )}

      <Button onClick={() => onPlay(friend)} variant="outline" size="sm" className="w-full">
        ▶ Oyna
      </Button>
    </motion.div>
  );
}

export default function FriendsPanel() {
  const { goToMenu, friends, addFriend, removeFriend, startGame } = useApp();
  const [newName, setNewName]   = useState('');
  const [error, setError]       = useState('');

  function handleAdd() {
    const name = newName.trim();
    if (!name) return;
    if (name.length < 2) { setError('En az 2 karakter gir.'); return; }
    if (friends.some(f => f.name.toLowerCase() === name.toLowerCase())) {
      setError('Bu isimde bir arkadaş zaten var.');
      return;
    }
    addFriend(name);
    setNewName('');
    setError('');
  }

  function handlePlay(friend) {
    startGame({
      mode: '1v1',
      pointCount: 9,
      playerNames: { 1: 'Ben', 2: friend.name },
      friendId: friend.id,
    });
  }

  return (
    <div className="full-screen flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-slate-800">
        <button onClick={goToMenu} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
          ←
        </button>
        <h1 className="text-xl font-black text-white">Arkadaşlar</h1>
        <span className="ml-auto text-xs text-slate-600">{friends.length} kişi</span>
      </div>

      {/* Add friend */}
      <div className="px-4 py-4 border-b border-slate-800">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
          Arkadaş Ekle
        </label>
        <div className="flex gap-2">
          <input
            className="flex-1 glass rounded-xl px-4 py-2.5 text-sm text-white border border-slate-700 focus:border-indigo-500 outline-none bg-transparent transition-colors placeholder-slate-600"
            placeholder="Arkadaş adı…"
            value={newName}
            onChange={e => { setNewName(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            maxLength={20}
          />
          <Button onClick={handleAdd} variant="primary" size="sm" disabled={!newName.trim()}>
            + Ekle
          </Button>
        </div>
        {error && <p className="text-xs text-rose-400 mt-1.5">{error}</p>}
      </div>

      {/* Friends list */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <AnimatePresence>
          {friends.length === 0 ? (
            <div className="text-center py-12 text-slate-600">
              <div className="text-4xl mb-3">👥</div>
              <p className="text-sm">Henüz arkadaş eklemedin.</p>
              <p className="text-xs mt-1">Arkadaş ekleyince burada görünecek ve istatistiklerin takip edilecek.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {friends.map(f => (
                <FriendCard
                  key={f.id}
                  friend={f}
                  onRemove={removeFriend}
                  onPlay={handlePlay}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
