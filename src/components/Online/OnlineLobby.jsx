import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { useOnlineGame } from '../../hooks/useOnlineGame';
import { COLOR_OPTIONS, DEFAULT_COLORS } from '../../utils/colors';
import Button from '../UI/Button';
import OnlineGame from './OnlineGame';

function ColorRow({ label, selected, onSelect, exclude }) {
  return (
    <div>
      <div className="text-xs text-slate-600 mb-1.5">{label}</div>
      <div className="flex flex-wrap gap-2">
        {COLOR_OPTIONS.filter(c => c.hex !== exclude).map(c => (
          <button key={c.id} onClick={() => onSelect(c.hex)} title={c.name}
            className={`w-7 h-7 rounded-full border-2 transition-all ${selected === c.hex ? 'border-white scale-110' : 'border-transparent opacity-70 hover:opacity-100'}`}
            style={{ background: c.hex }} />
        ))}
      </div>
    </div>
  );
}

function Leaderboard({ data, onRefresh, loading }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-slate-500">Tüm zamanların en iyi online oyuncuları.</p>
        <button onClick={onRefresh} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
          {loading ? '⟳' : '↻ Yenile'}
        </button>
      </div>
      {data.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-3xl mb-2">🏆</div>
          <p className="text-slate-500 text-sm">Henüz kayıtlı oyuncu yok.</p>
          <p className="text-slate-600 text-xs mt-1">Online oyun oynayarak sıralamaya gir!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.map((p, i) => {
            const total = (p.wins ?? 0) + (p.losses ?? 0) + (p.draws ?? 0);
            const winRate = total > 0 ? Math.round((p.wins / total) * 100) : 0;
            return (
              <motion.div key={p.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="glass rounded-xl px-4 py-3 flex items-center gap-3 border border-slate-700/30">
                <span className="text-lg font-black w-7 text-center" style={{
                  color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '#64748b'
                }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white truncate">{p.name}</div>
                  <div className="text-xs text-slate-500">
                    {p.wins}G · {p.losses}K · {p.draws ?? 0}B · {total} maç
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-400">{winRate}%</div>
                  <div className="text-[10px] text-slate-600">{p.wins} galibiyet</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const POINT_OPTIONS  = [10, 14, 18, 22, 26];
const TIMER_OPTIONS  = [
  { value: 0,  label: '∞',   desc: 'Süresiz' },
  { value: 15, label: '15s', desc: 'Hızlı'   },
  { value: 30, label: '30s', desc: 'Normal'  },
  { value: 60, label: '1dk', desc: 'Yavaş'   },
];
const TABS = [
  { id: 'quick',  label: '⚡ Hızlı' },
  { id: 'create', label: '➕ Oda' },
  { id: 'join',   label: '🔑 Katıl' },
  { id: 'board',  label: '🏆 Sıra' },
];

export default function OnlineLobby() {
  const { goToMenu, initialRoomCode, profile } = useApp();
  const {
    status, roomCode, myPlayerNum, gs, error, isMyTurn,
    chatMessages, leaderboard,
    rematchState, rematchFrom,
    turnTimeLeft, armedPowerUp,
    createRoom, joinRoom, findMatch, cancelMatch,
    handlePointClick, armPowerUp, passTurn, requestRestart, acceptRestart, declineRestart, sendChat, fetchLeaderboard, leave,
  } = useOnlineGame();

  const [tab,        setTab]    = useState(initialRoomCode ? 'join' : 'quick');
  const [playerName, setName]   = useState(profile?.name ?? '');
  const [joinCode,   setCode]   = useState(initialRoomCode || '');
  const [pointCount, setPoints] = useState(10);
  const [myColor,    setMyColor]   = useState(profile?.color ?? DEFAULT_COLORS[1]);
  const [oppColor,   setOppColor]  = useState(DEFAULT_COLORS[2]);
  const [turnTime,   setTurnTime]   = useState(30);
  const [powerUps,   setPowerUps]   = useState(true);
  const [lbLoading,  setLbLoading]  = useState(false);

  useEffect(() => {
    if (tab === 'board') { setLbLoading(true); fetchLeaderboard(); setTimeout(() => setLbLoading(false), 1000); }
  }, [tab]);

  function handleCreate() { createRoom(playerName.trim() || 'Oyuncu 1', { pointCount, playerColors: { 1: myColor, 2: oppColor }, turnTime, powerUps }); }
  function handleJoin()   { if (joinCode.trim().length < 4) return; joinRoom(joinCode.trim(), playerName.trim() || 'Oyuncu 2'); }
  function handleFind()   { findMatch(playerName.trim() || 'Oyuncu', { pointCount, preferredColor: myColor, turnTime, powerUps }); }
  function handleLeave()  { leave(); goToMenu(); }

  const inviteUrl = roomCode ? `${window.location.origin}?room=${roomCode}` : '';

  function copyInvite() { navigator.clipboard?.writeText(inviteUrl); }
  function copyCode()   { navigator.clipboard?.writeText(roomCode); }

  if (status === 'playing') {
    return (
      <OnlineGame
        gs={gs} myPlayerNum={myPlayerNum} isMyTurn={isMyTurn}
        onPointClick={handlePointClick} onRestart={requestRestart} onLeave={handleLeave}
        chatMessages={chatMessages} onSendChat={sendChat}
        rematchState={rematchState} rematchFrom={rematchFrom}
        onAcceptRestart={acceptRestart} onDeclineRestart={declineRestart}
        turnTimeLeft={turnTimeLeft} armedPowerUp={armedPowerUp} onArmPowerUp={armPowerUp} onPassTurn={passTurn}
      />
    );
  }

  if (status === 'disconnected') {
    return (
      <div className="full-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: 'var(--c-bg)' }}>
        <div className="text-5xl mb-4">🔌</div>
        <h2 className="text-xl font-bold text-white mb-2">Bağlantı Kesildi</h2>
        <p className="text-slate-400 text-sm mb-6 text-center">Rakip oyundan ayrıldı.</p>
        <Button onClick={handleLeave} variant="primary">Ana Menüye Dön</Button>
      </div>
    );
  }

  if (status === 'waiting') {
    return (
      <div className="full-screen overflow-y-auto" style={{ backgroundColor: 'var(--c-bg)' }}>
        <motion.div className="w-full max-w-md mx-auto px-4 py-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={handleLeave} className="text-slate-500 active:text-slate-300 mb-5 flex items-center gap-1 text-sm py-1">← Geri</button>
          <motion.div className="glass rounded-2xl p-8 border border-slate-700/40 text-center"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <motion.div className="text-5xl mb-4" animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>⏳</motion.div>
            <p className="text-slate-300 font-semibold mb-1">Rakip bekleniyor…</p>
            <p className="text-slate-500 text-sm mb-5">Bu kodu veya linki paylaş</p>

            <div className="bg-slate-800 rounded-xl py-4 px-6 mb-3 border border-slate-700">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Oda Kodu</div>
              <div className="text-4xl font-black text-indigo-400 tracking-[0.3em] font-mono">{roomCode}</div>
            </div>
            <div className="flex gap-2 mb-3">
              <button onClick={copyCode} className="flex-1 text-xs text-slate-500 hover:text-slate-300 transition-colors py-1 glass rounded-lg">
                📋 Kodu Kopyala
              </button>
              <button onClick={copyInvite} className="flex-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors py-1 glass rounded-lg border border-indigo-500/30">
                🔗 Link Paylaş
              </button>
            </div>
            <p className="text-[11px] text-slate-700 font-mono break-all">{inviteUrl}</p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (status === 'searching') {
    return (
      <div className="full-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: 'var(--c-bg)' }}>
        <motion.div className="text-6xl mb-6" animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}>🔍</motion.div>
        <h2 className="text-xl font-bold text-white mb-2">Rakip aranıyor…</h2>
        <p className="text-slate-400 text-sm mb-8 text-center">Sana uygun bir rakip bulmaya çalışıyoruz.</p>
        <div className="flex gap-1 mb-8">
          {[0,1,2].map(i => (
            <motion.div key={i} className="w-2 h-2 rounded-full bg-indigo-400"
              animate={{ opacity: [0.3,1,0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }} />
          ))}
        </div>
        <Button onClick={cancelMatch} variant="secondary">İptal</Button>
      </div>
    );
  }

  return (
    <div className="full-screen overflow-y-auto" style={{ backgroundColor: 'var(--c-bg)' }}>
      <motion.div className="w-full max-w-md mx-auto px-4 py-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <button onClick={handleLeave} className="text-slate-500 active:text-slate-300 mb-5 flex items-center gap-1 text-sm py-1">← Geri</button>
        <h2 className="text-2xl font-black text-white mb-5">🌐 Online Oyun</h2>

        {(status === 'creating' || status === 'joining') && (
          <div className="text-center py-16">
            <motion.div className="text-4xl mb-4" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>⚙️</motion.div>
            <p className="text-slate-400">{status === 'creating' ? 'Oda oluşturuluyor…' : 'Odaya katılınıyor…'}</p>
          </div>
        )}

        {status === 'idle' && (
          <>
            {error && (
              <motion.div className="bg-rose-500/15 border border-rose-500/30 rounded-xl px-4 py-2.5 text-rose-400 text-sm mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                ⚠️ {error}
              </motion.div>
            )}

            {/* Sekmeler */}
            <div className="flex rounded-xl bg-slate-800 p-1 mb-5">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${tab === t.id ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Ad alanı — quick/create/join */}
            {tab !== 'board' && (
              <div className="mb-4">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Adın</label>
                <input
                  className="w-full glass rounded-xl px-4 py-2.5 text-sm text-white border border-slate-700 focus:border-indigo-500 outline-none bg-transparent placeholder-slate-600"
                  placeholder="Oyuncu" value={playerName} onChange={e => setName(e.target.value)} maxLength={16} />
              </div>
            )}

            <AnimatePresence mode="wait">

              {/* Hızlı Eşleşme */}
              {tab === 'quick' && (
                <motion.div key="quick" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                  <div className="mb-4">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Nokta Sayısı</label>
                    <div className="flex flex-wrap gap-2">
                      {POINT_OPTIONS.map(n => (
                        <button key={n} onClick={() => setPoints(n)}
                          className={`flex-1 min-w-[56px] py-2 rounded-xl border-2 text-sm font-bold transition-all ${pointCount === n ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                          {n}
                          <div className="text-[10px] font-normal text-slate-600">{n === 10 ? 'Normal' : n === 14 ? 'Uzun' : n === 18 ? 'Epik' : n === 22 ? 'Mega' : 'Ultra'}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4 glass rounded-2xl p-4 border border-slate-700/40">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">🎨 Rengin</label>
                    <ColorRow label="" selected={myColor} onSelect={setMyColor} exclude={null} />
                  </div>
                  <div className="mb-5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">⏱ Hamle Süresi</label>
                    <div className="flex gap-2">
                      {TIMER_OPTIONS.map(t => (
                        <button key={t.value} onClick={() => setTurnTime(t.value)}
                          className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${turnTime === t.value ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                          {t.label}
                          <div className="text-xs font-normal text-slate-600">{t.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-5 flex items-center justify-between glass rounded-xl px-4 py-3 border border-slate-700/40">
                    <span className="text-sm text-slate-300">⚡ Özel Güçler</span>
                    <button onClick={() => setPowerUps(p => !p)}
                      className={`w-11 h-6 rounded-full transition-all relative ${powerUps ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${powerUps ? 'left-5.5' : 'left-0.5'}`} />
                    </button>
                  </div>
                  <Button onClick={handleFind} variant="primary" size="lg" className="w-full">Rakip Bul</Button>
                </motion.div>
              )}

              {/* Oda Oluştur */}
              {tab === 'create' && (
                <motion.div key="create" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                  <div className="mb-4">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Nokta Sayısı</label>
                    <div className="flex flex-wrap gap-2">
                      {POINT_OPTIONS.map(n => (
                        <button key={n} onClick={() => setPoints(n)}
                          className={`flex-1 min-w-[56px] py-2 rounded-xl border-2 text-sm font-bold transition-all ${pointCount === n ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                          {n}
                          <div className="text-[10px] font-normal text-slate-600">{n === 10 ? 'Normal' : n === 14 ? 'Uzun' : n === 18 ? 'Epik' : n === 22 ? 'Mega' : 'Ultra'}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-5 glass rounded-2xl p-4 border border-slate-700/40">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">🎨 Renkler</label>
                    <div className="space-y-3">
                      <ColorRow label="Senin rengin" selected={myColor} onSelect={setMyColor} exclude={oppColor} />
                      <ColorRow label="Rakip rengi"  selected={oppColor} onSelect={setOppColor} exclude={myColor} />
                    </div>
                    <div className="flex gap-2 mt-3">
                      <div className="flex-1 h-1.5 rounded-full" style={{ background: myColor }} />
                      <div className="flex-1 h-1.5 rounded-full" style={{ background: oppColor }} />
                    </div>
                  </div>
                  <div className="mb-5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">⏱ Hamle Süresi</label>
                    <div className="flex gap-2">
                      {TIMER_OPTIONS.map(t => (
                        <button key={t.value} onClick={() => setTurnTime(t.value)}
                          className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${turnTime === t.value ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                          {t.label}
                          <div className="text-xs font-normal text-slate-600">{t.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-5 flex items-center justify-between glass rounded-xl px-4 py-3 border border-slate-700/40">
                    <span className="text-sm text-slate-300">⚡ Özel Güçler</span>
                    <button onClick={() => setPowerUps(p => !p)}
                      className={`w-11 h-6 rounded-full transition-all relative ${powerUps ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${powerUps ? 'left-5.5' : 'left-0.5'}`} />
                    </button>
                  </div>
                  <Button onClick={handleCreate} variant="primary" size="lg" className="w-full">🌐 Oda Oluştur</Button>
                </motion.div>
              )}

              {/* Odaya Katıl */}
              {tab === 'join' && (
                <motion.div key="join" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                  <div className="mb-5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Oda Kodu</label>
                    <input
                      className="w-full glass rounded-xl px-4 py-3 text-2xl text-white border border-slate-700 focus:border-indigo-500 outline-none bg-transparent placeholder-slate-600 text-center tracking-[0.3em] font-mono uppercase"
                      placeholder="ABCD" value={joinCode} onChange={e => setCode(e.target.value.toUpperCase())} maxLength={4} />
                  </div>
                  <Button onClick={handleJoin} variant="primary" size="lg" className="w-full" disabled={joinCode.trim().length < 4}>
                    🔑 Odaya Katıl
                  </Button>
                </motion.div>
              )}

              {/* Liderlik Tablosu */}
              {tab === 'board' && (
                <motion.div key="board" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                  <Leaderboard
                    data={leaderboard}
                    loading={lbLoading}
                    onRefresh={() => { setLbLoading(true); fetchLeaderboard(); setTimeout(() => setLbLoading(false), 800); }}
                  />
                </motion.div>
              )}

            </AnimatePresence>
          </>
        )}
        <div className="h-8" />
      </motion.div>
    </div>
  );
}
