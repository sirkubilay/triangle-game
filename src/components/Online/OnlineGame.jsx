import { useState } from 'react';
import { isMuted, toggleMute } from '../../utils/sounds';
import GameBoard from '../Game/GameBoard';
import ScoreBoard from '../Game/ScoreBoard';
import TurnBanner from '../Game/TurnBanner';
import GameOverModal from '../Game/GameOverModal';
import ChatPanel from './ChatPanel';

export default function OnlineGame({ gs, myPlayerNum, isMyTurn, onPointClick, onRestart, onLeave, chatMessages, onSendChat }) {
  const [muted, setMuted] = useState(isMuted());
  if (!gs) return null;
  const lastScoredCount = gs.newTriangleIds?.length ?? 0;
  function handleMute() { const m = toggleMute(); setMuted(m); }

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

      <div className="shrink-0 h-4" />

      {gs.phase === 'over' && (
        <GameOverModal gs={gs} onRestart={onRestart} onMenu={onLeave} />
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
