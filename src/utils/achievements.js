const ACH_KEY = 'tg_ach_v1';

export const ACHIEVEMENTS = [
  { id: 'first_game',     icon: '🎯', title: 'İlk Adım',        desc: 'İlk oyununu oyna' },
  { id: 'first_win',      icon: '🏆', title: 'İlk Galibiyet',   desc: 'İlk kez kazan' },
  { id: 'hat_trick',      icon: '🔥', title: 'Hat-trick',        desc: 'Bir turda 3+ üçgen kapat' },
  { id: 'beat_hard',      icon: '🤖', title: 'Makine Kırıcı',   desc: "Zor AI'yı yen" },
  { id: 'online_win',     icon: '🌐', title: 'Online Savaşçı',  desc: 'Online maç kazan' },
  { id: 'veteran',        icon: '🎮', title: 'Veteran',          desc: '10 maç oyna' },
  { id: 'century',        icon: '💯', title: 'Üçgen Ustası',    desc: '100 toplam üçgen' },
  { id: 'power_use',      icon: '⚡', title: 'Güç Ustası',      desc: 'Güçlendirme kullan' },
  { id: 'daily_done',     icon: '📅', title: 'Günlük',           desc: 'Günlük bulmacayı tamamla' },
  { id: 'champion',       icon: '🏅', title: 'Şampiyon',         desc: 'Turnuvayı kazan' },
  { id: 'speed',          icon: '🚀', title: 'Hız Ustası',       desc: 'Zaman saldırısında 15+ üçgen' },
  { id: 'grid_win',       icon: '⊞', title: 'Izgara Ustası',    desc: 'Izgara modunda kazan' },
];

export function loadAchievements() {
  try {
    return JSON.parse(localStorage.getItem(ACH_KEY)) ?? {};
  } catch {
    return {};
  }
}

export function unlockAchievement(id) {
  const current = loadAchievements();
  if (current[id]) return false;
  current[id] = new Date().toISOString();
  try {
    localStorage.setItem(ACH_KEY, JSON.stringify(current));
  } catch {}
  return true;
}

export function checkAndUnlock(context) {
  const {
    stats,
    gameResult,
    mode,
    difficulty,
    powerUsed,
    trianglesInOneTurn,
    dailyDone,
    tournamentWon,
    timeAttackScore,
    layout,
  } = context ?? {};

  const unlocked = [];

  function tryUnlock(id) {
    if (unlockAchievement(id)) unlocked.push(id);
  }

  if (stats?.totalGames >= 1)     tryUnlock('first_game');
  if (stats?.wins >= 1)           tryUnlock('first_win');
  if (trianglesInOneTurn >= 3)    tryUnlock('hat_trick');
  if (mode === 'vsAI' && difficulty === 'hard' && gameResult === 'win') tryUnlock('beat_hard');
  if (mode === 'online' && gameResult === 'win') tryUnlock('online_win');
  if (stats?.totalGames >= 10)    tryUnlock('veteran');
  if (stats?.totalTriangles >= 100) tryUnlock('century');
  if (powerUsed)                  tryUnlock('power_use');
  if (dailyDone)                  tryUnlock('daily_done');
  if (tournamentWon)              tryUnlock('champion');
  if (timeAttackScore >= 15)      tryUnlock('speed');
  if (layout === 'grid' && gameResult === 'win') tryUnlock('grid_win');

  return unlocked;
}
