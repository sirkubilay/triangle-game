import { useState } from 'react';
import { useGame } from '../../hooks/useGame';
import { useApp } from '../../context/AppContext';
import { isMuted, toggleMute } from '../../utils/sounds';
import GameBoard from './GameBoard';
import ScoreBoard from './ScoreBoard';
import TurnBanner from './TurnBanner';
import GameOverModal from './GameOverModal';
import Timer from './Timer';
import HintButton from './HintButton';

export default function GamePage() {
  const { gameConfig, goToMenu, refreshStats } = useApp();
  const { gs, handlePointClick, resetGame, isAITurn, timeLeft, undoLastMove, canUndo, hintMoves } = useGame(gameConfig);
  const [muted, setMuted]       = useState(isMuted());
  const [hintMove, setHintMove] = useState(null);

  if (!gs) return null;
  const lastScoredCount = gs.newTriangleIds?.length ?? 0;

  function handleMenu() { refreshStats(); goToMenu(); }
  function handleHintReveal(move) { setHintMove(move); setTimeout(() => setHintMove(null), 3000); }
  function handleMute() { const m = toggleMute(); setMuted(m); }

  // Hamle yapılınca ipucunu kapat
  function handleClick(id) { setHintMove(null); handlePointClick(id); }

  const diffLabel = { easy: 'Kolay', medium: 'Orta', hard: 'Zor' };

  return (
    <div className="full-screen flex flex-col overflow-hidden bg-slate-900">

      {/* ── Üst çubuk ── */}
      <div className="flex items-center justify-between px-3 pt-2 pb-0 shrink-0">
        <button onClick={handleMenu} className="text-slate-500 active:text-slate-300 text-sm py-2 px-1">
          ← Menü
        </button>

        <div className="flex items-center gap-2">
          {gs.mode === 'vsAI' && (
            <span className="text-xs text-slate-500 border border-slate-700 rounded-full px-2 py-0.5">
              {diffLabel[gs.difficulty]}
            </span>
          )}
          <span className="text-xs text-slate-700">{gs.points.length} nokta</span>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={handleMute} className="text-slate-500 active:text-slate-300 text-sm p-1" title={muted ? 'Sesi aç' : 'Sesi kapat'}>
            {muted ? '🔇' : '🔊'}
          </button>
          <button onClick={resetGame} className="text-slate-500 active:text-slate-300 text-sm p-1">↺</button>
        </div>
      </div>

      {/* ── Skor ── */}
      <div className="shrink-0">
        <ScoreBoard gs={gs} isAITurn={isAITurn} />
      </div>

      {/* ── Sıra banner ── */}
      <div className="shrink-0">
        <TurnBanner gs={gs} isAITurn={isAITurn} lastScoredTriangles={lastScoredCount} />
      </div>

      {/* ── Tahta ── */}
      <div className="flex-1 min-h-0 px-2 pb-1">
        <GameBoard gs={gs} onPointClick={handleClick} isAITurn={isAITurn} hintMove={hintMove} />
      </div>

      {/* ── Alt araç çubuğu ── */}
      <div className="shrink-0 flex items-center justify-between px-3 pb-3 pt-1 gap-2">
        {/* Geri al — sadece vsAI */}
        <div className="w-16">
          {gs.mode === 'vsAI' && (
            <button
              onClick={undoLastMove}
              disabled={!canUndo}
              className="flex items-center gap-1 text-xs text-slate-500 disabled:opacity-30 active:text-slate-300 transition-colors py-1"
            >
              ↩ Geri
            </button>
          )}
        </div>

        {/* Sayaç — ortada */}
        {gs.phase === 'playing' && !isAITurn && (
          <Timer timeLeft={timeLeft} />
        )}

        {/* Ampul — sağda */}
        <div className="w-16 flex justify-end">
          {gs.phase === 'playing' && !isAITurn && (
            <HintButton hintMoves={hintMoves} onReveal={handleHintReveal} />
          )}
        </div>
      </div>

      {gs.phase === 'over' && (
        <GameOverModal gs={gs} onRestart={resetGame} onMenu={handleMenu} />
      )}
    </div>
  );
}
