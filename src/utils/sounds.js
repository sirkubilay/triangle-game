// Web Audio API — harici dosya yok, saf kod üretiyor
let ctx = null;
let muted = false;

function ac() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

function tone(freq, type, startTime, duration, gainVal = 0.25) {
  const c = ac();
  const osc  = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  gain.gain.setValueAtTime(gainVal, startTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.01);
}

export function toggleMute() { muted = !muted; return muted; }
export function isMuted() { return muted; }

export function playLineDraw() {
  if (muted) return;
  const c = ac();
  tone(300, 'sine', c.currentTime, 0.08, 0.15);
}

export function playTriangle(count = 1) {
  if (muted) return;
  const c = ac();
  const notes = count > 1 ? [523, 659, 784, 1047] : [523, 659, 784];
  notes.forEach((f, i) => tone(f, 'sine', c.currentTime + i * 0.07, 0.25, 0.18));
}

export function playUndo() {
  if (muted) return;
  const c = ac();
  [400, 320].forEach((f, i) => tone(f, 'triangle', c.currentTime + i * 0.07, 0.12, 0.15));
}

export function playTimerWarning() {
  if (muted) return;
  const c = ac();
  tone(880, 'square', c.currentTime, 0.06, 0.08);
}

export function playTimerEnd() {
  if (muted) return;
  const c = ac();
  tone(220, 'sawtooth', c.currentTime, 0.3, 0.2);
}

export function playGameWin() {
  if (muted) return;
  const c = ac();
  [523, 659, 784, 1047].forEach((f, i) => tone(f, 'sine', c.currentTime + i * 0.1, 0.4, 0.22));
}

export function playGameLose() {
  if (muted) return;
  const c = ac();
  [392, 349, 311, 261].forEach((f, i) => tone(f, 'triangle', c.currentTime + i * 0.12, 0.35, 0.18));
}
