import { useState } from 'react';
import { isMuted, toggleMute } from '../../utils/sounds';
import GameBoard from '../Game/GameBoard';
import ScoreBoard from '../Game/ScoreBoard';
import TurnBanner from '../Game/TurnBanner';
import GameOverModal from '../Game/GameOverModal';
import ChatPanel from './ChatPanel';

function PowerUpBtn({ icon, label, count, armed, disabled, onClick }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all
        ${armed ? 'border-amber-400 bg-amber-400/15 text-amber-300 animate-pulse' : 'border-slate-700 text-slate-400 hover:border-slate-500'}
        ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}>
      {icon} {label}
      <span className={`text-[10px] rounded-full px-1 ${armed ? 'bg-amber-400/30 text-amber-200' : 'bg-slate-700 text-slate-500'}`}>{count}</span>
    </button>
  );
}

export default function OnlineGame({ gs, myPlayerNum, isMyTurn, onPointClick, onRestart, onLeave, chatMessages, onSendChat, rematchState, rematchFrom, onAcceptRestart, onDeclineRestart, turnTimeLeft, armedPowerUp, onArmPowerUp, onPassTurn }) {
  const [muted, setMuted] = useState(isMuted());
  if (!gs) return null;
  const lastScoredCount = gs.newTriangleIds?.length ?? 0;
  function handleMute() { const m = toggleMute(); setMuted(m); }

  const turnTime = gs.turnTime ?? 0;
  const timerColor = !turnTimeLeft || turnTimeLeft > 10 ? 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10'
    : turnTimeLeft > 5 ? 'text-amber-400 border-amber-500/50 bg-amber-500/10'
    : 'text-rose-400 border-rose-500/50 bg-rose-500/10 animate-pulse';

  return (
    <div className="full-screen flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--c-bg)' }}>

      <div className="flex items-center justify-between px-3 pt-2 pb-0 shrink-0">
        <button onClick={onLeave} className="text-slate-500 active:text-slate-300 text-sm py-2 px-1">← Çık</button>
        <div className="flex items-center gap-1.5">
          <div className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border transition-all ${
            isMyTurn ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' : 'border-slate-700 text-slate-500'
          }`}>
            {isMyTurn ? '🟢 Sıran' : '⏳ Rakip'}
          </div>
          {turnTime > 0 && turnTimeLeft !== null && (
            <div className={`text-xs font-bold px-2 py-0.5 rounded-full border tabular-nums transition-all ${timerColor}`}>
              {isMyTurn ? '' : '👁 '}{turnTimeLeft}s
            </div>
          )}
          <span className="text-[10px] text-slate-700 border border-slate-800 rounded-full px-1.5 py-0.5">P{myPlayerNum}</span>
        </div>
        <button onClick={handleMute} className="text-slate-500 active:text-slate-300 text-sm p-1">
          {muted ? '🔇' : '🔊'}
        </button>
      </div>

      <div className="shrink-0"><ScoreBoard gs={gs} isAITurn={false} /></div>
      <div className="shrink-0"><TurnBanner gs={gs} isAITurn={false} lastScoredTriangles={lastScoredCount} /></div>

      <div className="flex-1 min-h-0 px-2 pb-1">
        <GameBoard gs={gs} onPointClick={onPointClick} isAITurn={!isMyTurn} hintMove={null} />
      </div>

      {isMyTurn && gs.phase === 'playing' && (() => {
        const myPU = gs.powerUps?.[myPlayerNum] ?? {};
        return (
          <div className="shrink-0 flex items-center gap-2 px-3 pb-1 flex-wrap">
            {gs.powerUps && (<>
              <span className="text-[10px] text-slate-600 uppercase tracking-wider">Güç:</span>
              <PowerUpBtn icon="⚡" label="Çift" count={myPU.doubleScore ?? 0}
                armed={armedPowerUp === 'doubleScore'} disabled={(myPU.doubleScore ?? 0) === 0}
                onClick={() => onArmPowerUp('doubleScore')} />
              <PowerUpBtn icon="🔄" label="Ekstra" count={myPU.extraTurn ?? 0}
                armed={armedPowerUp === 'extraTurn'} disabled={(myPU.extraTurn ?? 0) === 0}
                onClick={() => onArmPowerUp('extraTurn')} />
              <PowerUpBtn icon="🛑" label="Engel" count={myPU.blockTurn ?? 0}
                armed={armedPowerUp === 'blockTurn'} disabled={(myPU.blockTurn ?? 0) === 0}
                onClick={() => onArmPowerUp('blockTurn')} />
              {armedPowerUp && (
                <span className="text-[10px] text-amber-400 animate-pulse">
                  {{ doubleScore: '⚡ hazır', extraTurn: '🔄 hazır', blockTurn: '🛑 hazır' }[armedPowerUp]}
                </span>
              )}
              <span className="text-slate-700">|</span>
            </>)}
            <button onClick={onPassTurn}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-700 text-xs font-semibold text-slate-400 hover:border-slate-500 hover:text-slate-300 transition-all">
              ⏭ Pas
            </button>
          </div>
        );
      })()}

      <div className="shrink-0 h-2" />

      {gs.phase === 'over' && rematchState === 'idle' && (
        <GameOverModal gs={gs} onRestart={onRestart} onMenu={onLeave} />
      )}

      {/* Rematç bekleniyor */}
      {gs.phase === 'over' && rematchState === 'requested' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm">
          <div className="glass rounded-3xl p-8 max-w-xs w-full mx-4 text-center border border-slate-700/50">
            <div className="text-4xl mb-3 animate-pulse">⏳</div>
            <p className="text-white font-bold mb-1">Rematç istendi</p>
            <p className="text-slate-400 text-sm">Rakip yanıt bekliyor…</p>
          </div>
        </div>
      )}

      {/* Rematç teklifi geldi */}
      {gs.phase === 'over' && rematchState === 'pending' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm">
          <div className="glass rounded-3xl p-8 max-w-xs w-full mx-4 text-center border border-indigo-500/40">
            <div className="text-4xl mb-3">🤝</div>
            <p className="text-white font-bold mb-1">Rematç Teklifi</p>
            <p className="text-slate-400 text-sm mb-6">
              <span className="text-indigo-300 font-semibold">{rematchFrom}</span> tekrar oynamak istiyor!
            </p>
            <div className="flex gap-3">
              <button onClick={onDeclineRestart}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 font-semibold text-sm hover:border-slate-500 transition-colors">
                Reddet
              </button>
              <button onClick={onAcceptRestart}
                className="flex-1 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm transition-colors">
                Kabul Et!
              </button>
            </div>
          </div>
        </div>
      )}

      <ChatPanel
        messages={chatMessages}
        onSend={onSendChat}
        myPlayerNum={myPlayerNum}
        playerColors={gs.playerColors}
        playerNames={gs.playerNames}
      />
    </div>
  );
}
