import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'https://triangle-game-production.up.railway.app';
console.log('[socket] SERVER_URL:', SERVER_URL);
let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(SERVER_URL, { autoConnect: false, transports: ['polling', 'websocket'] });
    socket.on('connect', () => console.log('[socket] bağlandı:', socket.id));
    socket.on('connect_error', (e) => console.error('[socket] bağlantı hatası:', e.message));
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) { socket.disconnect(); socket = null; }
}
