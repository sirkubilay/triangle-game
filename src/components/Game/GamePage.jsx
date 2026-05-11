import { useState, useEffect, useRef } from 'react';
import { useGame } from '../../hooks/useGame';
import { useApp } from '../../context/AppContext';
import { isMuted, toggleMute } from '../../utils/sounds';
import { loadStats } from '../../utils/storage';
import { checkAndUnlock } from '../../utils/achievements';
import { saveDailyResult, getDailyStars } from '../../utils/daily';
import { saveDailyScore } from '../../utils/firestore';
import GameBoard from './GameBoard';
import ScoreBoard from './ScoreBoard';
import TurnBanner from './TurnBanner';
import GameOverModal from './GameOverModal';
import Timer from './Timer';
import HintButton from './HintButton';
import AchievementToast from '../UI/AchievementToast';

function GlobalTimer({ timeLeft, total }) {
  const pct = total > 0 ? timeLeft / total : 0;
  const radius = 20;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - pct);
  const isWarning = timeLeft <= 15;
  const color = timeLeft <= 10 ? '#ef4444' : timeLeft <= 20 ? '#fbbf24' : '#34d399';

  return (
    <div className="flex items-center gap-2">
      <svg width="52" height="52" viewBox="0 0 52 52">
        <circle cx="26" cy="26" r={radius} fill="none" stroke="#1e293b" strokeWidth="4"/>
        <circle cx="26" cy="26" r={radius} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
        />
        <text x="26" y="31" textAnchor="middle" fontSize="13" fontWeight="900" fill={color}>{timeLeft}</text>
      </svg>
    </div>
  );
}

function PowerUpButton({ icon, label, count, armed, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`relative flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl border transition-all
        ${armed
          ? 'border-amber-400 bg-amber-400/20 text-amber-300 pulse-glow'
          : disabled
            ? 'border-slate-800 text-slate-700 cursor-not-allowed'
            : 'border-slate-700 text-slate-400 hover:border-amber-600 hover:text-amber-400'
        }`}
    >
      <span>{icon}</span>
      <span className="hidden sm:inline">{label}</span>
      {count > 0 && (
        <span className={`text-[10px] font-bold ${armed ? 'text-amber-300' : 'text-slate-600'}`}>×{count}</span>
      )}
    </button>
  );
}

export default function GamePage() {
  const { gameConfig, goToMenu, refreshStats, unlockAchievement } = useApp();
  const { gs, handlePointClick, resetGame, isAITurn, timeLeft, undoLastMove, canUndo, hintMoves, armPowerUp, globalTimeLeft, isTimedMode, isDailyMode } = useGame(gameConfig);
  const [muted, setMuted]       = useState(isMuted());
  const [hintMove, setHintMove] = useState(null);
  const [toastIds, setToastIds] = useState([]);
  const achChecked = useRef(false);

  if (!gs) return null;
  const lastScoredCount = gs.newTriangleIds?.length ?? 0;
  const cp = gs.currentPlayer;
  const myPU = gs.powerUps?.[cp];

  function handleMenu() { refreshStats(); goToMenu(); }
  function handleHintReveal(move) { setHintMove(move); setTimeout(() => setHintMove(null), 3000); }
  function handleMute() { const m = toggleMute(); setMuted(m); }
  function handleClick(id) { setHintMove(null); handlePointClick(id); }

  const diffLabel = { easy: 'Kolay', medium: 'Orta', hard: 'Zor' };
  const hasPowerUps = !!gs.powerUps;
  const isPlayerTurn = !isAITurn && gs.phase === 'playing';
  const globalTotal  = isTimedMode ? 90 : 0;
  const movesLeft    = isDailyMode ? ((gs.moveLimit ?? 18) - (gs.movesUsed ?? 0)) : null;

  // Check achievements when game ends
  useEffect(() => {
    if (gs.phase !== 'over' || achChecked.current) return;
    achChecked.current = true;
    const stats = loadStats();
    const outcome = gs.winner === 1 ? 'win' : gs.winner === 2 ? 'loss' : 'draw';
    const isTimeAttack = gs.mode === 'timeAttack';
    if (gs.mode === 'daily') {
      const dailyScore = gs.scores?.[1] ?? 0;
      saveDailyResult(dailyScore);
      saveDailyScore({
        name: gs.playerNames?.[1] ?? 'Oyuncu',
        score: dailyScore,
        stars: getDailyStars(dailyScore),
      });
    }
    const context = {
      stats,
      gameResult: outcome,
      mode: gs.mode,
      difficulty: gs.difficulty,
      powerUsed: gs.powerUsed,
      trianglesInOneTurn: gs.maxTrianglesInOneTurn ?? 0,
      timeAttackScore: isTimeAttack ? (gs.scores?.[1] ?? 0) : 0,
      layout: gs.layout,
      dailyDone: isDailyMode,
    };
    const unlocked = checkAndUnlock(context);
    if (unlocked.length > 0) {
      setToastIds(unlocked);
    }
  }, [gs.phase]);

  // Reset achChecked on reset
  useEffect(() => {
    if (gs.phase === 'playing') achChecked.current = false;
  }, [gs.phase]);

  return (
    <div className="full-screen flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--c-bg)' }}>

      {/* Achievement toast */}
      {toastIds.length > 0 && (
        <AchievementToast ids={toastIds} onDismiss={() => setToastIds([])} />
      )}

      {/* Üst çubuk */}
      <div className="flex items-center justify-between px-3 pt-2 pb-0 shrink-0">
        <button onClick={handleMenu} className="text-slate-500 active:text-slate-300 text-sm py-2 px-1">← Menü</button>
        <div className="flex items-center gap-2">
          {isTimedMode && gs.phase === 'playing' && (
            <GlobalTimer timeLeft={globalTimeLeft} total={globalTotal} />
          )}
          {isDailyMode && (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-bold transition-colors ${
              movesLeft <= 3
                ? 'border-rose-500/50 bg-rose-500/10 text-rose-400'
                : 'border-amber-500/40 bg-amber-500/8 text-amber-400'
            }`}>
              <span>{movesLeft}</span>
              <span className="text-xs font-normal text-slate-500">hamle</span>
            </div>
          )}
          {gs.mode === 'vsAI' && (
            <span className="text-xs text-slate-500 border border-slate-700 rounded-full px-2 py-0.5">
              {diffLabel[gs.difficulty]}
            </span>
          )}
          {!isTimedMode && !isDailyMode && <span className="text-xs text-slate-700">{gs.points.length} nokta</span>}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleMute} className="text-slate-500 active:text-slate-300 text-sm p-1">
            {muted ? '🔇' : '🔊'}
          </button>
          <button onClick={resetGame} className="text-slate-500 active:text-slate-300 text-sm p-1">↺</button>
        </div>
      </div>

      {/* Skor */}
      <div className="shrink-0"><ScoreBoard gs={gs} isAITurn={isAITurn} /></div>

      {/* Sıra banner */}
      {!isTimedMode && !isDailyMode && <div className="shrink-0"><TurnBanner gs={gs} isAITurn={isAITurn} lastScoredTriangles={lastScoredCount} /></div>}

      {/* Tahta */}
      <div className="flex-1 min-h-0 px-2 pb-1">
        <GameBoard gs={gs} onPointClick={handleClick} isAITurn={isAITurn} hintMove={hintMove} />
      </div>

      {/* Güçlendirme satırı */}
      {hasPowerUps && isPlayerTurn && (
        <div className="shrink-0 flex items-center gap-2 px-3 pb-1">
          <span className="text-[10px] text-slate-600 uppercase tracking-wider mr-1">Güç:</span>
          <PowerUpButton
            icon="⚡" label="Çift Puan"
            count={myPU?.doubleScore ?? 0}
            armed={gs.armedPowerUp === 'doubleScore'}
            disabled={(myPU?.doubleScore ?? 0) === 0}
            onClick={() => armPowerUp('doubleScore')}
          />
          <PowerUpButton
            icon="🔄" label="Ekstra"
            count={myPU?.extraTurn ?? 0}
            armed={gs.armedPowerUp === 'extraTurn'}
            disabled={(myPU?.extraTurn ?? 0) === 0}
            onClick={() => armPowerUp('extraTurn')}
          />
          {gs.armedPowerUp && (
            <span className="text-[10px] text-amber-400 animate-pulse ml-1">
              {gs.armedPowerUp === 'doubleScore' ? '⚡ aktif' : '🔄 aktif'}
            </span>
          )}
        </div>
      )}

      {/* Alt araç çubuğu */}
      <div className="shrink-0 flex items-center justify-between px-3 pb-3 pt-1 gap-2">
        <div className="w-16">
          {gs.mode === 'vsAI' && (
            <button onClick={undoLastMove} disabled={!canUndo}
              className="flex items-center gap-1 text-xs text-slate-500 disabled:opacity-30 active:text-slate-300 transition-colors py-1">
              ↩ Geri
            </button>
          )}
        </div>
        {gs.phase === 'playing' && !isAITurn && !isTimedMode && <Timer timeLeft={timeLeft} />}
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
