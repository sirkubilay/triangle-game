const STATS_KEY = 'tc_stats_v1';
const FRIENDS_KEY = 'tc_friends_v1';

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function save(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

const defaultStats = () => ({
  totalGames: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  totalTriangles: 0,
  vsAIWins: { easy: 0, medium: 0, hard: 0 },
  history: [],
});

export const loadStats = () => load(STATS_KEY, defaultStats());
export const saveStats = (s) => save(STATS_KEY, s);

export function updateStatsAfterGame({ outcome, vsAI, difficulty, playerTriangles, opponentTriangles, playerNames, mode }) {
  const s = loadStats();
  s.totalGames++;
  if (outcome === 'win') s.wins++;
  else if (outcome === 'loss') s.losses++;
  else s.draws++;
  s.totalTriangles += playerTriangles || 0;
  if (vsAI && outcome === 'win') s.vsAIWins[difficulty] = (s.vsAIWins[difficulty] || 0) + 1;
  s.history.unshift({
    date: new Date().toISOString(),
    outcome, vsAI, difficulty, mode,
    scores: { player: playerTriangles, opponent: opponentTriangles },
    playerNames,
  });
  if (s.history.length > 30) s.history = s.history.slice(0, 30);
  saveStats(s);
  return s;
}

export const loadFriends = () => load(FRIENDS_KEY, []);
export const saveFriends = (f) => save(FRIENDS_KEY, f);

export function addFriend(name) {
  const friends = loadFriends();
  if (friends.some(f => f.name.toLowerCase() === name.toLowerCase())) return friends;
  const updated = [...friends, {
    id: Date.now(),
    name: name.trim(),
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
