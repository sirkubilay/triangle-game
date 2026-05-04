import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const ALLOWED_ORIGINS = ['https://triangle-game.vercel.app', 'https://triangle-game-server.onrender.com', 'http://localhost:5173'];
app.use(cors({ origin: ALLOWED_ORIGINS }));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: ALLOWED_ORIGINS, methods: ['GET', 'POST'] },
});

const rooms = new Map();
const matchmakingQueue = [];

function genCode() {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

function generatePoints(count, width = 760, height = 500, padding = 72) {
  const points = [];
  const minDist = Math.max(65, Math.min(width, height) / (count * 0.72));
  let attempts = 0;
  while (points.length < count && attempts < 8000) {
    const x = padding + Math.random() * (width - 2 * padding);
    const y = padding + Math.random() * (height - 2 * padding);
    const tooClose = points.some(p => Math.hypot(p.x - x, p.y - y) < minDist);
    if (!tooClose) points.push({ id: points.length, x: Math.round(x), y: Math.round(y) });
    attempts++;
  }
  return points;
}

function removeFromQueue(socketId) {
  const idx = matchmakingQueue.findIndex(p => p.socketId === socketId);
  if (idx !== -1) matchmakingQueue.splice(idx, 1);
}

io.on('connection', (socket) => {
  console.log('Bağlandı:', socket.id);

  socket.on('create-room', ({ playerName, gameConfig }) => {
    const code   = genCode();
    const points = generatePoints(gameConfig.pointCount ?? 10);
    rooms.set(code, {
      code,
      players: [{ id: socket.id, name: playerName, num: 1 }],
      points,
      gameConfig,
      started: false,
    });
    socket.join(code);
    socket.data.roomCode = code;
    socket.emit('room-created', { code, playerNum: 1 });
    console.log(`Oda oluşturuldu: ${code} — ${playerName}`);
  });

  socket.on('join-room', ({ code, playerName }) => {
    const room = rooms.get(code?.toUpperCase());
    if (!room)                    { socket.emit('join-error', { msg: 'Oda bulunamadı.' });  return; }
    if (room.started)             { socket.emit('join-error', { msg: 'Oyun başlamış.' });   return; }
    if (room.players.length >= 2) { socket.emit('join-error', { msg: 'Oda dolu.' });        return; }

    room.players.push({ id: socket.id, name: playerName, num: 2 });
    room.started = true;
    socket.join(code.toUpperCase());
    socket.data.roomCode = code.toUpperCase();

    const fullConfig = {
      ...room.gameConfig,
      mode: 'online',
      points: room.points,
      playerNames: { 1: room.players[0].name, 2: room.players[1].name },
    };

    io.to(room.players[0].id).emit('game-start', { gameConfig: fullConfig, playerNum: 1, code: code.toUpperCase() });
    io.to(room.players[1].id).emit('game-start', { gameConfig: fullConfig, playerNum: 2, code: code.toUpperCase() });
    console.log(`Oyun başladı: ${code.toUpperCase()}`);
  });

  socket.on('find-match', ({ playerName, gameConfig }) => {
    removeFromQueue(socket.id);
    matchmakingQueue.push({ socketId: socket.id, playerName, gameConfig });
    console.log(`Kuyruk: ${matchmakingQueue.length} kişi — ${playerName}`);

    if (matchmakingQueue.length >= 2) {
      const [p1, p2] = matchmakingQueue.splice(0, 2);
      const code   = genCode();
      const points = generatePoints(p1.gameConfig?.pointCount ?? 10);

      const room = {
        code,
        players: [
          { id: p1.socketId, name: p1.playerName, num: 1 },
          { id: p2.socketId, name: p2.playerName, num: 2 },
        ],
        points,
        gameConfig: p1.gameConfig,
        started: true,
      };
      rooms.set(code, room);

      const s1 = io.sockets.sockets.get(p1.socketId);
      const s2 = io.sockets.sockets.get(p2.socketId);
      if (s1) { s1.join(code); s1.data.roomCode = code; }
      if (s2) { s2.join(code); s2.data.roomCode = code; }

      const fullConfig = {
        ...p1.gameConfig,
        mode: 'online',
        points,
        playerNames: { 1: p1.playerName, 2: p2.playerName },
      };

      io.to(p1.socketId).emit('game-start', { gameConfig: fullConfig, playerNum: 1, code });
      io.to(p2.socketId).emit('game-start', { gameConfig: fullConfig, playerNum: 2, code });
      console.log(`Eşleşme bulundu: ${code} — ${p1.playerName} vs ${p2.playerName}`);
    }
  });

  socket.on('cancel-match', () => {
    removeFromQueue(socket.id);
  });

  socket.on('make-move', ({ code, p1, p2 }) => {
    socket.to(code).emit('opponent-move', { p1, p2 });
  });

  socket.on('restart-game', ({ code }) => {
    const room = rooms.get(code);
    if (!room) return;
    const points = generatePoints(room.gameConfig.pointCount ?? 10);
    room.points  = points;
    const fullConfig = {
      ...room.gameConfig,
      mode: 'online',
      points,
      playerNames: { 1: room.players[0].name, 2: room.players[1].name },
    };
    io.to(code).emit('game-restart', { gameConfig: fullConfig });
  });

  socket.on('disconnect', () => {
    removeFromQueue(socket.id);
    const code = socket.data.roomCode;
    if (code) {
      socket.to(code).emit('player-left');
      rooms.delete(code);
      console.log(`Oda silindi: ${code}`);
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => console.log(`Oyun sunucusu: http://localhost:${PORT}`));
