export const DAILY_MOVE_LIMIT  = 18;
export const DAILY_POINT_COUNT = 12;

export function getDailyStars(score) {
  if (score >= 6) return 3;
  if (score >= 3) return 2;
  if (score >= 1) return 1;
  return 0;
}

// Seeded RNG — returns a function that produces deterministic 0-1 values
export function seededRandom(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s ^ (s << 13)) >>> 0;
    s = (s ^ (s >>> 17)) >>> 0;
    s = (s ^ (s << 5))  >>> 0;
    return (s >>> 0) / 4294967296;
  };
}

export function getDailySeed() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return Number(`${y}${m}${d}`);
}

export function generateDailyPoints(count = 12, width = 760, height = 500, padding = 72) {
  const rand = seededRandom(getDailySeed());
  const points = [];
  const minDist = Math.max(65, Math.min(width, height) / (count * 0.72));
  let attempts = 0;

  while (points.length < count && attempts < 8000) {
    const x = padding + rand() * (width - 2 * padding);
    const y = padding + rand() * (height - 2 * padding);
    const tooClose = points.some(p => Math.hypot(p.x - x, p.y - y) < minDist);
    if (!tooClose) points.push({ id: points.length, x: Math.round(x), y: Math.round(y) });
    attempts++;
  }
  return points;
}

export function getDailyKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `tg_daily_${y}${m}${d}`;
}

export function loadDailyResult() {
  try {
    return JSON.parse(localStorage.getItem(getDailyKey())) ?? null;
  } catch {
    return null;
  }
}

export function saveDailyResult(score) {
  const existing = loadDailyResult();
  // Don't overwrite a better score
  if (existing && existing.score >= score) return existing;
  const result = { completed: true, score, date: new Date().toISOString() };
  try {
    localStorage.setItem(getDailyKey(), JSON.stringify(result));
  } catch {}
  return result;
}
