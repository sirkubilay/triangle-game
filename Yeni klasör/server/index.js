const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

const rooms = new Map();

function genCode() {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

// Sunucu tarafında nokta üretimi (istemciyle aynı algoritma)
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
    if (!room)              { socket.emit('join-error', { msg: 'Oda bulunamadı.' });    return; }
    if (room.started)       { socket.emit('join-error', { msg: 'Oyun başlamış.' });     return; }
    if (room.players.length >= 2) { socket.emit('join-error', { msg: 'Oda dolu.' });  return; }

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

    // Her oyuncuya kendi numarasını gönder
    io.to(room.players[0].id).emit('game-start', { gameConfig: fullConfig, playerNum: 1 });
    io.to(room.players[1].id).emit('game-start', { gameConfig: fullConfig, playerNum: 2 });
    console.log(`Oyun başladı: ${code.toUpperCase()}`);
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
    const code = socket.data.roomCode;
    if (code) {
      socket.to(code).emit('player-left');
      rooms.delete(code);
      console.log(`Oda silindi: ${code}`);
    }
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => console.log(`Oyun sunucusu: http://localhost:${PORT}`));
