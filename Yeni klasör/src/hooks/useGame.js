import { useState, useEffect, useCallback, useRef } from 'react';
import {
  generatePoints, lineKey, lineExists, isMoveLegal,
  findNewTriangles, isGameOver, getAllPossibleMoves,
} from '../utils/triangleLogic';
import { getAIMove } from '../utils/aiLogic';
import { updateStatsAfterGame, updateFriendResult } from '../utils/storage';
import { playLineDraw, playTriangle, playUndo, playTimerWarning, playTimerEnd, playGameWin, playGameLose } from '../utils/sounds';
import { DEFAULT_COLORS } from '../utils/colors';

const AI_DELAY   = 900;
const TURN_TIME  = 30;

function buildInitialState(cfg) {
  if (!cfg) return null;
  return {
    points: cfg.points ?? generatePoints(cfg.pointCount ?? 10, 760, 500),
    lines: [], triangles: [],
    scores: { 1: 0, 2: 0 },
    currentPlayer: 1,
    selectedPoint: null,
    phase: 'playing',
    winner: null,
    newLineIds: [], newTriangleIds: [],
    mode: cfg.mode,
    difficulty: cfg.difficulty ?? null,
    playerNames:  cfg.playerNames  ?? { 1: 'Oyuncu 1', 2: 'Oyuncu 2' },
    playerColors: cfg.playerColors ?? DEFAULT_COLORS,
    friendId: cfg.friendId ?? null,
  };
}

export function useGame(config) {
  const cfgRef       = useRef(config);
  const [gs, setGs]  = useState(() => buildInitialState(config));
  const aiTimerRef   = useRef(null);
  const statsWritten = useRef(false);
  const undoStack    = useRef([]);   // vsAI geri alma geçmişi (maks 3)
  const [timeLeft, setTimeLeft] = useState(TURN_TIME);

  const isAITurn = gs?.mode === 'vsAI' && gs?.currentPlayer === 2 && gs?.phase === 'playing';

  // ── AI hamlesi ──
  useEffect(() => {
    if (!isAITurn) return;
    aiTimerRef.current = setTimeout(() => {
      setGs(prev => {
        if (!prev || prev.phase !== 'playing' || prev.currentPlayer !== 2) return prev;
        const move = getAIMove(prev.lines, prev.points, prev.difficulty);
        if (!move) return prev;
        return applyMove(prev, move.p1, move.p2);
      });
    }, AI_DELAY);
    return () => clearTimeout(aiTimerRef.current);
  }, [isAITurn, gs?.lines?.length]);

  // ── Geri sayım ──
  useEffect(() => {
    if (!gs || gs.phase !== 'playing' || isAITurn) {
      setTimeLeft(TURN_TIME);
      return;
    }
    setTimeLeft(TURN_TIME);
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 10 && t > 1)  playTimerWarning();
        if (t <= 1) { clearInterval(id); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [gs?.currentPlayer, gs?.phase, isAITurn]);

  // Süre bitince sıra geç
  useEffect(() => {
    if (timeLeft !== 0 || !gs || gs.phase !== 'playing' || isAITurn) return;
    playTimerEnd();
    setGs(prev => {
      if (!prev || prev.phase !== 'playing') return prev;
      return { ...prev, currentPlayer: prev.currentPlayer === 1 ? 2 : 1, selectedPoint: null, newLineIds: [], newTriangleIds: [] };
    });
  }, [timeLeft]);

  // ── Hamle uygula ──
  function applyMove(prev, rawP1, rawP2) {
    const p1 = Math.min(rawP1, rawP2), p2 = Math.max(rawP1, rawP2);
    if (lineExists(prev.lines, p1, p2)) return prev;
    if (!isMoveLegal(prev.lines, prev.points, p1, p2)) return prev;

    const newLine       = { id: lineKey(p1, p2), p1, p2, player: prev.currentPlayer };
    const updatedLines  = [...prev.lines, newLine];
    const rawTris       = findNewTriangles(prev.lines, p1, p2);
    const existingIds   = new Set(prev.triangles.map(t => t.id));
    const newTris       = rawTris
      .map(t => ({ ...t, id: `${t.p1}-${t.p2}-${t.p3}`, player: prev.currentPlayer }))
      .filter(t => !existingIds.has(t.id));

    const updatedTriangles = [...prev.triangles, ...newTris];
    const scored           = newTris.length;
    const updatedScores    = { ...prev.scores, [prev.currentPlayer]: prev.scores[prev.currentPlayer] + scored };

    // Ses
    if (scored > 0) playTriangle(scored); else playLineDraw();

    const over = isGameOver(updatedLines, prev.points);
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

    const nextPlayer = scored > 0 && !over ? prev.currentPlayer : (prev.currentPlayer === 1 ? 2 : 1);
    return {
      ...prev,
      lines: updatedLines, triangles: updatedTriangles, scores: updatedScores,
      currentPlayer: over ? prev.currentPlayer : nextPlayer,
      selectedPoint: null,
      phase: over ? 'over' : 'playing',
      winner: over ? winner : null,
      newLineIds: [newLine.id], newTriangleIds: newTris.map(t => t.id),
    };
  }

  const handlePointClick = useCallback((pointId) => {
    setGs(prev => {
      if (!prev || prev.phase === 'over') return prev;
      if (prev.mode === 'vsAI' && prev.currentPlayer === 2) return prev;
      const { selectedPoint, lines, points } = prev;
      if (selectedPoint === null) return { ...prev, selectedPoint: pointId, newLineIds: [], newTriangleIds: [] };
      if (selectedPoint === pointId) return { ...prev, selectedPoint: null };
      if (lineExists(lines, selectedPoint, pointId) || !isMoveLegal(lines, points, selectedPoint, pointId))
        return { ...prev, selectedPoint: pointId };

      // vsAI modunda geri alma geçmişi kaydet
      if (prev.mode === 'vsAI') {
        const last = undoStack.current[undoStack.current.length - 1];
        if (!last || last.lines.length !== prev.lines.length) {
          undoStack.current = [...undoStack.current.slice(-2), prev];
        }
      }
      return applyMove(prev, selectedPoint, pointId);
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
    statsWritten.current = false;
    undoStack.current    = [];
    setGs(buildInitialState(cfgRef.current));
  }, []);

  // Ampul: aktif oyuncunun üçgen kapatacak hamleleri
  const hintMoves = (!gs || gs.phase !== 'playing' || isAITurn)
    ? []
    : getAllPossibleMoves(gs.lines, gs.points)
        .filter(m => findNewTriangles(gs.lines, m.p1, m.p2).length > 0);

  const canUndo = gs?.mode === 'vsAI' && undoStack.current.length > 0 && gs?.phase === 'playing';

  return { gs, handlePointClick, resetGame, isAITurn, timeLeft, undoLastMove, canUndo, hintMoves };
}
