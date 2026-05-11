import { useState, useEffect, useCallback, useRef } from 'react';
import {
  generatePoints, generateGridPoints, lineKey, lineExists, isMoveLegal, isSubsegment,
  findNewTriangles, isGameOver, getAllPossibleMoves, findConflictLine, getNeighbors,
} from '../utils/triangleLogic';
import { getAIMove } from '../utils/aiLogic';
import { updateStatsAfterGame, updateFriendResult } from '../utils/storage';
import { playLineDraw, playTriangle, playUndo, playTimerWarning, playTimerEnd, playGameWin, playGameLose } from '../utils/sounds';
import { DEFAULT_COLORS } from '../utils/colors';

const AI_DELAY  = 900;
const TURN_TIME = 30;

const GLOBAL_TIME = {
  timeAttack: 90,
};

function buildInitialState(cfg) {
  if (!cfg) return null;
  let points;
  if (cfg.points && cfg.points.length > 0) {
    points = cfg.points;
  } else if (cfg.layout === 'grid' && cfg.gridRows && cfg.gridCols) {
    points = generateGridPoints(cfg.gridRows, cfg.gridCols);
  } else {
    points = generatePoints(cfg.pointCount ?? 10, 760, 500);
  }
  return {
    points,
    lines: [], triangles: [],
    scores: { 1: 0, 2: 0 },
    currentPlayer: 1,
    selectedPoint: null,
    phase: 'playing',
    winner: null,
    newLineIds: [], newTriangleIds: [],
    rejectedMove: null,
    mode: cfg.mode,
    difficulty: cfg.difficulty ?? null,
    playerNames:  cfg.playerNames  ?? { 1: 'Oyuncu 1', 2: 'Oyuncu 2' },
    playerColors: cfg.playerColors ?? DEFAULT_COLORS,
    friendId: cfg.friendId ?? null,
    layout: cfg.layout ?? 'random',
    // Power-ups
    powerUps: cfg.powerUps ? {
      1: { doubleScore: 1, extraTurn: 1 },
      2: { doubleScore: 1, extraTurn: 1 },
    } : null,
    armedPowerUp: null,
    // Daily puzzle move tracking
    moveLimit: cfg.mode === 'daily' ? (cfg.moveLimit ?? 18) : null,
    movesUsed: 0,
    // Tracking
    maxTrianglesInOneTurn: 0,
    powerUsed: false,
  };
}

export function useGame(config) {
  const cfgRef          = useRef(config);
  const [gs, setGs]     = useState(() => buildInitialState(config));
  const aiTimerRef      = useRef(null);
  const aiMoveInFlight  = useRef(false);
  const statsWritten    = useRef(false);
  const undoStack       = useRef([]);
  const timedOutCounts  = useRef({ 1: 0, 2: 0 });
  const [timeLeft, setTimeLeft] = useState(TURN_TIME);

  function getTurnTime(player) {
    const c = timedOutCounts.current[player] ?? 0;
    if (c >= 2) return 10;
    if (c === 1) return 15;
    return TURN_TIME;
  }

  // Only timeAttack uses a global timer; daily uses move limit instead
  const isTimedMode = gs?.mode === 'timeAttack';
  const isDailyMode = gs?.mode === 'daily';
  const globalDuration = isTimedMode ? (GLOBAL_TIME[gs.mode] ?? 90) : null;
  const [globalTimeLeft, setGlobalTimeLeft] = useState(() => globalDuration ?? 0);
  const globalTimerRef = useRef(null);

  const isAITurn = gs?.mode === 'vsAI' && gs?.currentPlayer === 2 && gs?.phase === 'playing';

  // AI turn
  useEffect(() => {
    if (!isAITurn) { aiMoveInFlight.current = false; return; }
    if (aiMoveInFlight.current) return;
    aiMoveInFlight.current = true;
    aiTimerRef.current = setTimeout(() => {
      setGs(prev => {
        aiMoveInFlight.current = false;
        if (!prev || prev.phase !== 'playing' || prev.currentPlayer !== 2) return prev;
        const move = getAIMove(prev.lines, prev.points, prev.difficulty);
        if (!move) return prev;
        return applyMove(prev, move.p1, move.p2);
      });
    }, AI_DELAY);
    return () => {
      clearTimeout(aiTimerRef.current);
      aiMoveInFlight.current = false;
    };
  }, [isAITurn, gs?.lines?.length]);

  // Per-turn timer (not used in timed or daily modes)
  useEffect(() => {
    if (isTimedMode || isDailyMode) return;
    if (!gs || gs.phase !== 'playing' || isAITurn) { setTimeLeft(TURN_TIME); return; }
    setTimeLeft(getTurnTime(gs.currentPlayer));
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 10 && t > 1) playTimerWarning();
        if (t <= 1) { clearInterval(id); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [gs?.currentPlayer, gs?.phase, isAITurn, gs?.lines?.length, isTimedMode]);

  useEffect(() => {
    if (isTimedMode || isDailyMode) return;
    if (timeLeft !== 0 || !gs || gs.phase !== 'playing' || isAITurn) return;
    playTimerEnd();
    setGs(prev => {
      if (!prev || prev.phase !== 'playing') return prev;
      timedOutCounts.current[prev.currentPlayer] = (timedOutCounts.current[prev.currentPlayer] ?? 0) + 1;
      return { ...prev, currentPlayer: prev.currentPlayer === 1 ? 2 : 1, selectedPoint: null, newLineIds: [], newTriangleIds: [], armedPowerUp: null };
    });
  }, [timeLeft, isTimedMode]);

  // Global timer for timed modes
  useEffect(() => {
    if (!isTimedMode || !gs || gs.phase !== 'playing') return;
    const duration = GLOBAL_TIME[gs.mode] ?? 90;
    setGlobalTimeLeft(duration);
    globalTimerRef.current = setInterval(() => {
      setGlobalTimeLeft(t => {
        if (t <= 10 && t > 1) playTimerWarning();
        if (t <= 1) {
          clearInterval(globalTimerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(globalTimerRef.current);
  }, [gs?.mode, gs?.phase === 'playing' && isTimedMode ? gs.phase : null]);

  // End game when global timer hits 0
  useEffect(() => {
    if (!isTimedMode || globalTimeLeft !== 0 || !gs || gs.phase !== 'playing') return;
    playTimerEnd();
    setGs(prev => {
      if (!prev || prev.phase !== 'playing') return prev;
      const s1 = prev.scores[1];
      const winner = s1 > 0 ? 1 : null;
      if (!statsWritten.current) {
        statsWritten.current = true;
        if (s1 > 0) playGameWin();
        updateStatsAfterGame({
          outcome: 'win',
          vsAI: false,
          difficulty: null,
          playerTriangles: s1,
          opponentTriangles: 0,
          playerNames: prev.playerNames,
          mode: prev.mode,
        });
      }
      return { ...prev, phase: 'over', winner };
    });
  }, [globalTimeLeft, isTimedMode]);

  function applyMove(prev, rawP1, rawP2) {
    const p1 = Math.min(rawP1, rawP2), p2 = Math.max(rawP1, rawP2);
    if (lineExists(prev.lines, p1, p2)) { console.log(`[SKIP] ${p1}-${p2} zaten var`); return prev; }
    if (!isMoveLegal(prev.lines, prev.points, p1, p2)) { console.log(`[REJECT] ${p1}-${p2} kesişiyor`); return prev; }

    const newLine      = { id: lineKey(p1, p2), p1, p2, player: prev.currentPlayer };
    const updatedLines = [...prev.lines, newLine];
    const rawTris      = findNewTriangles(prev.lines, p1, p2, prev.points);
    console.log(`[TRI] Çizgi: ${p1}-${p2} | Mevcut: [${prev.lines.map(l=>`${l.p1}-${l.p2}`).join(', ')}] | Üçgenler: [${rawTris.map(t=>`{${t.p1},${t.p2},${t.p3}}`).join(', ')||'yok'}] | Skor: ${prev.scores[1]}→${prev.scores[prev.currentPlayer]+(rawTris.length)} (P${prev.currentPlayer})`);
    const existingIds = new Set(prev.triangles.map(t => t.id));
    const newTris = rawTris
      .map(t => {
        const pa = prev.points[t.p1], pb = prev.points[t.p2], pc = prev.points[t.p3];
        const area = Math.abs((pb.x - pa.x) * (pc.y - pa.y) - (pc.x - pa.x) * (pb.y - pa.y));
        return { ...t, id: `${t.p1}-${t.p2}-${t.p3}`, player: prev.currentPlayer, area };
      })
      .filter(t => !existingIds.has(t.id));

    const updatedTriangles = [...prev.triangles, ...newTris];
    const scored           = newTris.length;

    // Power-up effects
    const armed = prev.armedPowerUp;
    const hasDouble = armed === 'doubleScore' && prev.powerUps?.[prev.currentPlayer]?.doubleScore > 0;
    const hasExtra  = armed === 'extraTurn'   && prev.powerUps?.[prev.currentPlayer]?.extraTurn  > 0;

    const effectiveScore = scored * (hasDouble ? 2 : 1);
    const updatedScores  = { ...prev.scores, [prev.currentPlayer]: prev.scores[prev.currentPlayer] + effectiveScore };

    if (scored > 0) playTriangle(scored); else playLineDraw();

    // Consume power-up
    let newPowerUps = prev.powerUps;
    const newPowerUsed = prev.powerUsed || (armed !== null && armed !== undefined);
    if (armed && prev.powerUps) {
      const cp = prev.currentPlayer;
      newPowerUps = {
        ...prev.powerUps,
        [cp]: { ...prev.powerUps[cp], [armed]: Math.max(0, prev.powerUps[cp][armed] - 1) },
      };
    }

    // Track max triangles in one turn
    const newMaxTri = Math.max(prev.maxTrianglesInOneTurn ?? 0, scored);

    // Daily mode: count moves and end when limit reached
    const newMovesUsed = prev.mode === 'daily' ? (prev.movesUsed ?? 0) + 1 : prev.movesUsed;
    const moveLimitReached = prev.mode === 'daily' && newMovesUsed >= (prev.moveLimit ?? 18);

    const over = isGameOver(updatedLines, prev.points) || moveLimitReached;
    let winner = null;

    if (over && !statsWritten.current) {
      statsWritten.current = true;
      const s1 = updatedScores[1], s2 = updatedScores[2];
      winner = s1 > s2 ? 1 : s2 > s1 ? 2 : 0;
      const outcome = winner === 1 ? 'win' : winner === 2 ? 'loss' : 'draw';
      if (outcome === 'win') playGameWin(); else if (outcome === 'loss') playGameLose();
      updateStatsAfterGame({
        outcome, vsAI: prev.mode === 'vsAI', difficulty: prev.difficulty,
        playerTriangles: s1, opponentTriangles: s2,
        playerNames: prev.playerNames, mode: prev.mode,
      });
      if (prev.friendId && prev.mode === '1v1')
        updateFriendResult(prev.friendId, outcome === 'win' ? 'wins' : outcome === 'loss' ? 'losses' : 'draws');
    } else if (over) {
      const s1 = updatedScores[1], s2 = updatedScores[2];
      winner = s1 > s2 ? 1 : s2 > s1 ? 2 : 0;
    }

    // Next player: scored → stay, extraTurn+no score → stay, else → switch
    const stayNormal = scored > 0 && !over;
    const stayExtra  = hasExtra && scored === 0 && !over;
    // In timed single-player mode, always stay on player 1
    const isSinglePlayer = prev.mode === 'timeAttack' || prev.mode === 'daily';
    const nextPlayer = isSinglePlayer ? 1 : ((stayNormal || stayExtra) ? prev.currentPlayer : (prev.currentPlayer === 1 ? 2 : 1));

    return {
      ...prev,
      lines: updatedLines, triangles: updatedTriangles, scores: updatedScores,
      currentPlayer: over ? prev.currentPlayer : nextPlayer,
      selectedPoint: null,
      phase: over ? 'over' : 'playing',
      winner: over ? winner : null,
      newLineIds: [newLine.id], newTriangleIds: newTris.map(t => t.id),
      powerUps: newPowerUps,
      armedPowerUp: null,
      maxTrianglesInOneTurn: newMaxTri,
      powerUsed: newPowerUsed,
      movesUsed: newMovesUsed,
      rejectedMove: null,
    };
  }

  const handlePointClick = useCallback((pointId) => {
    setGs(prev => {
      if (!prev || prev.phase === 'over') return prev;
      if (prev.mode === 'vsAI' && prev.currentPlayer === 2) return prev;
      const { selectedPoint, lines, points } = prev;
      if (selectedPoint === null) return { ...prev, selectedPoint: pointId, newLineIds: [], newTriangleIds: [], rejectedMove: null };
      if (selectedPoint === pointId) return { ...prev, selectedPoint: null };
      const alreadyExists  = lineExists(lines, selectedPoint, pointId);
      const moveLegal      = isMoveLegal(lines, points, selectedPoint, pointId);
      const isSub          = isSubsegment(lines, points, selectedPoint, pointId);
      if (alreadyExists || !moveLegal || isSub) {
        const illegal = !alreadyExists && (!moveLegal || isSub);
        if (illegal) {
          const conflict = !moveLegal ? findConflictLine(lines, points, selectedPoint, pointId) : null;
          return {
            ...prev,
            selectedPoint,
            rejectedMove: { p1: selectedPoint, p2: pointId, conflictLineId: conflict?.id ?? null, id: Date.now() },
          };
        }
        return { ...prev, selectedPoint: pointId, rejectedMove: null };
      }
      if (prev.mode === 'vsAI') {
        const last = undoStack.current[undoStack.current.length - 1];
        if (!last || last.lines.length !== prev.lines.length) {
          undoStack.current = [...undoStack.current.slice(-2), prev];
        }
      }
      timedOutCounts.current[prev.currentPlayer] = 0;
      return applyMove(prev, selectedPoint, pointId);
    });
  }, []);

  const armPowerUp = useCallback((type) => {
    setGs(prev => {
      if (!prev || prev.phase !== 'playing' || !prev.powerUps) return prev;
      const cp = prev.currentPlayer;
      if (prev.mode === 'vsAI' && cp !== 1) return prev;
      if ((prev.powerUps[cp][type] ?? 0) <= 0) return prev;
      return { ...prev, armedPowerUp: prev.armedPowerUp === type ? null : type };
    });
  }, []);

  const undoLastMove = useCallback(() => {
    if (!undoStack.current.length) return;
    clearTimeout(aiTimerRef.current);
    statsWritten.current = false;
    playUndo();
    setGs(undoStack.current.pop());
  }, []);

  const resetGame = useCallback(() => {
    clearTimeout(aiTimerRef.current);
    clearInterval(globalTimerRef.current);
    statsWritten.current = false;
    undoStack.current    = [];
    timedOutCounts.current = { 1: 0, 2: 0 };
    const newState = buildInitialState(cfgRef.current);
    setGs(newState);
    if (isTimedMode && newState) {
      setGlobalTimeLeft(GLOBAL_TIME[newState.mode] ?? 90);
    }
  }, [isTimedMode, isDailyMode]);

  // Reddedilen hamleni 600ms sonra temizle
  useEffect(() => {
    if (!gs?.rejectedMove) return;
    const id = setTimeout(() => {
      setGs(prev => prev ? { ...prev, rejectedMove: null } : prev);
    }, 600);
    return () => clearTimeout(id);
  }, [gs?.rejectedMove?.id]);

  const existingTriIds = gs ? new Set(gs.triangles.map(t => t.id)) : new Set();
  const hintMoves = (!gs || gs.phase !== 'playing' || isAITurn)
    ? []
    : getAllPossibleMoves(gs.lines, gs.points)
        .filter(m => {
          const n1 = getNeighbors(m.p1, gs.lines);
          const n2Set = new Set(getNeighbors(m.p2, gs.lines));
          return n1.some(c => {
            if (!n2Set.has(c) || c === m.p1 || c === m.p2) return false;
            const [a, b, d] = [m.p1, m.p2, c].sort((x, y) => x - y);
            return !existingTriIds.has(`${a}-${b}-${d}`);
          });
        });

  const canUndo = gs?.mode === 'vsAI' && undoStack.current.length > 0 && gs?.phase === 'playing';

  return {
    gs, handlePointClick, resetGame, isAITurn, timeLeft, undoLastMove, canUndo,
    hintMoves, armPowerUp, globalTimeLeft, isTimedMode, isDailyMode,
  };
}
