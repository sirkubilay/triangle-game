const STATS_KEY   = 'tc_stats_v2';
const FRIENDS_KEY = 'tc_friends_v1';

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function save(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

function defaultModes() {
  return {
    '1v1': {
      played: 0, wins: 0, losses: 0, draws: 0,
      totalTriangles: 0, highScore: 0, highScoreDate: null,
    },
    vsAI: {
      played: 0, wins: 0, losses: 0,
      highScore: 0, highScoreDate: null,
      byDifficulty: {
        easy:   { played: 0, wins: 0 },
        medium: { played: 0, wins: 0 },
        hard:   { played: 0, wins: 0 },
      },
    },
    timeAttack: { played: 0, highScore: 0, highScoreDate: null },
    daily:      { played: 0, bestScore: 0, bestScoreDate: null, bestStars: 0 },
    online:     { played: 0, wins: 0, losses: 0, draws: 0 },
  };
}

const defaultStats = () => ({
  totalGames: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  totalTriangles: 0,
  vsAIWins: { easy: 0, medium: 0, hard: 0 },
  history: [],
  modes: defaultModes(),
});

export function loadStats() {
  const s = load(STATS_KEY, null);
  if (!s) return defaultStats();
  if (!s.modes) s.modes = defaultModes();
  else {
    const dm = defaultModes();
    for (const key of Object.keys(dm)) {
      if (!s.modes[key]) s.modes[key] = dm[key];
    }
    // ensure vsAI.byDifficulty exists
    if (!s.modes.vsAI.byDifficulty) s.modes.vsAI.byDifficulty = defaultModes().vsAI.byDifficulty;
  }
  return s;
}

export const saveStats = (s) => save(STATS_KEY, s);

export function updateStatsAfterGame({
  outcome, vsAI, difficulty, playerTriangles, opponentTriangles, playerNames, mode,
}) {
  const s   = loadStats();
  const m   = s.modes;
  const pts = playerTriangles || 0;
  const now = new Date().toISOString();

  // ── Global ───────────────────────────────────────
  s.totalGames++;
  if (outcome === 'win')       s.wins++;
  else if (outcome === 'loss') s.losses++;
  else                         s.draws++;
  s.totalTriangles += pts;
  if (vsAI && outcome === 'win' && difficulty)
    s.vsAIWins[difficulty] = (s.vsAIWins[difficulty] || 0) + 1;

  // ── Mode-specific ─────────────────────────────────
  if (mode === '1v1') {
    m['1v1'].played++;
    if (outcome === 'win')       m['1v1'].wins++;
    else if (outcome === 'loss') m['1v1'].losses++;
    else                         m['1v1'].draws++;
    m['1v1'].totalTriangles += pts;
    if (outcome === 'win' && pts > m['1v1'].highScore) {
      m['1v1'].highScore = pts;  m['1v1'].highScoreDate = now;
    }

  } else if (mode === 'vsAI') {
    m.vsAI.played++;
    if (outcome === 'win')       m.vsAI.wins++;
    else if (outcome === 'loss') m.vsAI.losses++;
    if (pts > m.vsAI.highScore) {
      m.vsAI.highScore = pts;  m.vsAI.highScoreDate = now;
    }
    if (difficulty && m.vsAI.byDifficulty[difficulty]) {
      m.vsAI.byDifficulty[difficulty].played++;
      if (outcome === 'win') m.vsAI.byDifficulty[difficulty].wins++;
    }

  } else if (mode === 'timeAttack') {
    m.timeAttack.played++;
    if (pts > m.timeAttack.highScore) {
      m.timeAttack.highScore = pts;  m.timeAttack.highScoreDate = now;
    }

  } else if (mode === 'daily') {
    m.daily.played++;
    if (pts > m.daily.bestScore) {
      m.daily.bestScore = pts;  m.daily.bestScoreDate = now;
      m.daily.bestStars = pts >= 6 ? 3 : pts >= 3 ? 2 : pts >= 1 ? 1 : 0;
    }

  } else if (mode === 'online') {
    m.online.played++;
    if (outcome === 'win')       m.online.wins++;
    else if (outcome === 'loss') m.online.losses++;
    else                         m.online.draws++;
  }

  // ── History ──────────────────────────────────────
  s.history.unshift({
    date: now, outcome, vsAI, difficulty, mode,
    scores: { player: pts, opponent: opponentTriangles || 0 },
    playerNames,
  });
  if (s.history.length > 50) s.history = s.history.slice(0, 50);

  saveStats(s);
  return s;
}

export const loadFriends = () => load(FRIENDS_KEY, []);
export const saveFriends = (f) => save(FRIENDS_KEY, f);

export function addFriend(name) {
  const friends = loadFriends();
  if (friends.some(f => f.name.toLowerCase() === name.toLowerCase())) return friends;
  const updated = [...friends, {
    id: Date.now(), name: name.trim(),
    addedAt: new Date().toISOString(),
    wins: 0, losses: 0, draws: 0,
  }];
  saveFriends(updated);
  return updated;
}

export function removeFriend(id) {
  const updated = loadFriends().filter(f => f.id !== id);
  saveFriends(updated);
  return updated;
}

export function updateFriendResult(friendId, outcome) {
  const updated = loadFriends().map(f =>
    f.id === friendId ? { ...f, [outcome]: (f[outcome] || 0) + 1 } : f
  );
  saveFriends(updated);
  return updated;
}
