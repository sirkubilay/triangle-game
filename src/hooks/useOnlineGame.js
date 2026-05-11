import { useState, useEffect, useCallback, useRef } from 'react';
import { getSocket, disconnectSocket } from '../utils/socket';
import { lineKey, lineExists, isMoveLegal, isSubsegment, findNewTriangles, isGameOver } from '../utils/triangleLogic';
import { playLineDraw, playTriangle, playGameWin, playGameLose } from '../utils/sounds';

function buildState(cfg) {
  return {
    points: cfg.points,
    lines: [], triangles: [],
    scores: { 1: 0, 2: 0 },
    currentPlayer: 1, selectedPoint: null,
    phase: 'playing', winner: null,
    newLineIds: [], newTriangleIds: [],
    playerNames:  cfg.playerNames,
    playerColors: cfg.playerColors ?? { 1: '#818cf8', 2: '#fb7185' },
    mode: 'online',
  };
}

function applyMove(prev, rawP1, rawP2) {
  const p1 = Math.min(rawP1, rawP2), p2 = Math.max(rawP1, rawP2);
  if (lineExists(prev.lines, p1, p2)) return prev;
  if (!isMoveLegal(prev.lines, prev.points, p1, p2)) return prev;

  const newLine   = { id: lineKey(p1, p2), p1, p2, player: prev.currentPlayer };
  const updLines  = [...prev.lines, newLine];
  const rawTris   = findNewTriangles(prev.lines, p1, p2, prev.points);
  const exIds     = new Set(prev.triangles.map(t => t.id));
  const newTris   = rawTris
    .map(t => ({ ...t, id: `${t.p1}-${t.p2}-${t.p3}`, player: prev.currentPlayer }))
    .filter(t => !exIds.has(t.id));

  const updTris   = [...prev.triangles, ...newTris];
  const scored    = newTris.length;
  const updScores = { ...prev.scores, [prev.currentPlayer]: prev.scores[prev.currentPlayer] + scored };

  if (scored > 0) playTriangle(scored); else playLineDraw();

  const over = isGameOver(updLines, prev.points);
  let winner = null;
  if (over) {
    const s1 = updScores[1], s2 = updScores[2];
    winner = s1 > s2 ? 1 : s2 > s1 ? 2 : 0;
  }
  const nextPlayer = scored > 0 && !over ? prev.currentPlayer : (prev.currentPlayer === 1 ? 2 : 1);
  return {
    ...prev,
    lines: updLines, triangles: updTris, scores: updScores,
    currentPlayer: over ? prev.currentPlayer : nextPlayer,
    selectedPoint: null,
    phase: over ? 'over' : 'playing',
    winner: over ? winner : null,
    newLineIds: [newLine.id], newTriangleIds: newTris.map(t => t.id),
  };
}

export function useOnlineGame() {
  const [status,          setStatus]      = useState('idle');
  const [roomCode,        setRoomCode]    = useState('');
  const [myPlayerNum,     setMyPlayerNum] = useState(null);
  const [gs,              setGs]          = useState(null);
  const [error,           setError]       = useState('');
  const [chatMessages,    setChat]        = useState([]);
  const [leaderboard,     setLeaderboard] = useState([]);
  const [rematchState,    setRematch]     = useState('idle'); // 'idle' | 'requested' | 'pending'
  const [rematchFrom,     setRematchFrom] = useState('');
  const configRef     = useRef(null);
  const myNameRef     = useRef('');
  const resultReported = useRef(false);

  useEffect(() => {
    const socket = getSocket();
    socket.connect();

    socket.on('room-created', ({ code, playerNum }) => {
      setRoomCode(code); setMyPlayerNum(playerNum); setStatus('waiting');
    });
    socket.on('game-start', ({ gameConfig, playerNum, code }) => {
      setMyPlayerNum(playerNum);
      setGs(buildState(gameConfig));
      configRef.current = gameConfig;
      if (code) setRoomCode(code);
      setStatus('playing');
      setChat([]);
      resultReported.current = false;
    });
    socket.on('opponent-move', ({ p1, p2 }) => {
      setGs(prev => prev ? applyMove(prev, p1, p2) : prev);
    });
    socket.on('game-restart', ({ gameConfig }) => {
      setGs(buildState(gameConfig));
      configRef.current = gameConfig;
      setStatus('playing');
      setChat([]);
      setRematch('idle');
      resultReported.current = false;
    });
    socket.on('restart-request', ({ from }) => { setRematch('pending'); setRematchFrom(from); });
    socket.on('restart-declined', () => { setRematch('idle'); });
    socket.on('player-left', () => setStatus('disconnected'));
    socket.on('join-error',  ({ msg }) => { setError(msg); setStatus('idle'); });
    socket.on('chat-message', (msg) => { setChat(prev => [...prev.slice(-49), msg]); });
    socket.on('leaderboard', (data) => { setLeaderboard(data); });

    return () => {
      socket.off('room-created'); socket.off('game-start');
      socket.off('opponent-move'); socket.off('game-restart');
      socket.off('restart-request'); socket.off('restart-declined');
      socket.off('player-left'); socket.off('join-error');
      socket.off('chat-message'); socket.off('leaderboard');
    };
  }, []);

  // Report result when game ends
  useEffect(() => {
    if (!gs || gs.phase !== 'over' || !myPlayerNum || resultReported.current) return;
    resultReported.current = true;
    const winner = gs.winner;
    let result;
    if (winner === 0) result = 'draw';
    else result = winner === myPlayerNum ? 'win' : 'loss';
    if (winner === myPlayerNum) playGameWin(); else if (winner !== 0) playGameLose();
    getSocket().emit('report-result', { playerName: myNameRef.current, result });
  }, [gs?.phase, gs?.winner, myPlayerNum]);

  const createRoom = useCallback((playerName, gameConfig) => {
    myNameRef.current = playerName;
    setError(''); setStatus('creating');
    configRef.current = gameConfig;
    getSocket().emit('create-room', { playerName, gameConfig });
  }, []);

  const joinRoom = useCallback((code, playerName) => {
    myNameRef.current = playerName;
    setError(''); setStatus('joining');
    getSocket().emit('join-room', { code: code.toUpperCase(), playerName });
  }, []);

  const findMatch = useCallback((playerName, gameConfig) => {
    myNameRef.current = playerName;
    setError(''); setStatus('searching');
    configRef.current = gameConfig;
    getSocket().emit('find-match', { playerName, gameConfig });
  }, []);

  const cancelMatch = useCallback(() => {
    getSocket().emit('cancel-match'); setStatus('idle');
  }, []);

  const handlePointClick = useCallback((pointId) => {
    if (!gs || gs.phase !== 'playing') return;
    if (gs.currentPlayer !== myPlayerNum) return;
    const { selectedPoint, lines, points } = gs;
    if (selectedPoint === null) { setGs(p => ({ ...p, selectedPoint: pointId, newLineIds: [], newTriangleIds: [] })); return; }
    if (selectedPoint === pointId) { setGs(p => ({ ...p, selectedPoint: null })); return; }
    if (lineExists(lines, selectedPoint, pointId) || !isMoveLegal(lines, points, selectedPoint, pointId) || isSubsegment(lines, points, selectedPoint, pointId)) {
      setGs(p => ({ ...p, selectedPoint: pointId })); return;
    }
    const p1 = Math.min(selectedPoint, pointId), p2 = Math.max(selectedPoint, pointId);
    getSocket().emit('make-move', { code: roomCode, p1, p2 });
    setGs(prev => applyMove(prev, p1, p2));
  }, [gs, myPlayerNum, roomCode]);

  const requestRestart = useCallback(() => {
    setRematch('requested');
    getSocket().emit('restart-game', { code: roomCode });
  }, [roomCode]);

  const acceptRestart = useCallback(() => {
    setRematch('requested');
    getSocket().emit('restart-game', { code: roomCode });
  }, [roomCode]);

  const declineRestart = useCallback(() => {
    setRematch('idle');
    getSocket().emit('decline-restart', { code: roomCode });
  }, [roomCode]);

  const sendChat = useCallback((message) => {
    getSocket().emit('chat-message', { code: roomCode, message });
  }, [roomCode]);

  const fetchLeaderboard = useCallback(() => {
    getSocket().emit('get-leaderboard');
  }, []);

  const leave = useCallback(() => {
    getSocket().emit('cancel-match');
    disconnectSocket();
    setStatus('idle'); setGs(null); setRoomCode(''); setChat([]);
  }, []);

  const isMyTurn = gs?.phase === 'playing' && gs?.currentPlayer === myPlayerNum;

  return {
    status, roomCode, myPlayerNum, gs, error, isMyTurn,
    chatMessages, leaderboard,
    rematchState, rematchFrom,
    createRoom, joinRoom, findMatch, cancelMatch,
    handlePointClick, requestRestart, acceptRestart, declineRestart, sendChat, fetchLeaderboard, leave,
  };
}
