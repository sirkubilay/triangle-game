const ACH_KEY = 'tg_ach_v1';

export const ACHIEVEMENTS = [
  // ── Mevcut ───────────────────────────────────────────────────────────
  { id: 'first_game',        icon: '🎯', title: 'İlk Adım',          desc: 'İlk oyununu oyna',                          hint: 'Herhangi bir modda 1 oyun oyna' },
  { id: 'first_win',         icon: '🏆', title: 'İlk Galibiyet',     desc: 'İlk kez kazan',                             hint: 'Herhangi bir modda ilk galibiyetini al' },
  { id: 'hat_trick',         icon: '🔥', title: 'Hat-trick',          desc: 'Bir turda 3+ üçgen kapat',                  hint: 'Tek hamlede aynı anda 3 veya daha fazla üçgen tamamla' },
  { id: 'beat_hard',         icon: '🤖', title: 'Makine Kırıcı',     desc: "Zor AI'yı yen",                             hint: "AI modunda Zor seviyesini seç ve kazan" },
  { id: 'online_win',        icon: '🌐', title: 'Online Savaşçı',    desc: 'Online maç kazan',                          hint: 'Çevrimiçi modda bir rakibe karşı kazan' },
  { id: 'veteran',           icon: '🎮', title: 'Veteran',            desc: '10 maç oyna',                               hint: 'Toplam 10 maç tamamla (mod fark etmez)' },
  { id: 'century',           icon: '💯', title: 'Üçgen Ustası',      desc: '100 toplam üçgen kapat',                    hint: 'Tüm oyunlarda toplamda 100 üçgen tamamla' },
  { id: 'power_use',         icon: '⚡', title: 'Güç Ustası',        desc: 'Güçlendirme kullan',                        hint: 'Bir oyunda güçlendirme (power-up) aktifleştir' },
  { id: 'daily_done',        icon: '📅', title: 'Günlük',             desc: 'Günlük bulmacayı tamamla',                  hint: 'Ana menüden Günlük Bulmaca moduna gir ve bitir' },
  { id: 'speed',             icon: '🚀', title: 'Hız Ustası',         desc: 'Zaman saldırısında 15+ üçgen',             hint: 'Zaman Saldırısı modunda 15 veya daha fazla üçgen kapat' },
  { id: 'grid_win',          icon: '⊞',  title: 'Izgara Ustası',     desc: 'Izgara modunda kazan',                      hint: 'Oyun kurulumunda Izgara düzenini seç ve kazan' },
  { id: 'champion',          icon: '🏅', title: 'Şampiyon',           desc: 'Turnuvayı kazan',                           hint: 'Turnuva modunu tamamla ve birinci ol' },

  // ── Yeni: Yapay Zeka ─────────────────────────────────────────────────
  { id: 'beat_easy',         icon: '😌', title: 'Isınma Turu',       desc: "Kolay AI'yı yen",                           hint: "AI modunda Kolay seviyeyi seç ve kazan" },
  { id: 'beat_medium',       icon: '🧠', title: 'Strateji Ustası',   desc: "Orta AI'yı yen",                            hint: "AI modunda Orta seviyeyi seç ve kazan" },
  { id: 'ai_destroyer',      icon: '💀', title: 'AI Katil',           desc: 'Her zorluk seviyesinde AI\'yı yen',         hint: "Kolay, Orta ve Zor AI'yı en az birer kez yen" },

  // ── Yeni: Skor / Üçgen ───────────────────────────────────────────────
  { id: 'hat_trick_plus',    icon: '🌪️', title: 'Kasırga',           desc: 'Bir turda 5+ üçgen kapat',                  hint: 'Tek bir hamlede aynı anda 5 veya daha fazla üçgen tamamla' },
  { id: 'dominator',         icon: '👑', title: 'Hükümdar',           desc: 'Bir oyunda 15+ üçgen kapat',               hint: 'Tek bir oyun içinde toplamda 15 veya daha fazla üçgen tamamla' },
  { id: 'big_game',          icon: '💫', title: 'Büyük Oyun',         desc: 'Bir oyunda 20+ üçgen kapat',               hint: 'Tek bir oyun içinde toplamda 20 veya daha fazla üçgen tamamla' },
  { id: 'iron_wall',         icon: '🛡️', title: 'Demir Kalkan',      desc: 'Rakibi 0 üçgenle bırakarak kazan',          hint: 'Rakip hiç üçgen katamazken sen galip gel' },
  { id: 'triangles_50',      icon: '△',  title: 'İlk 50',             desc: '50 toplam üçgen kapat',                    hint: 'Tüm oyunlarda toplamda 50 üçgen tamamla' },
  { id: 'triangles_500',     icon: '▲',  title: 'Koleksiyoncu',       desc: '500 toplam üçgen kapat',                   hint: 'Tüm oyunlarda toplamda 500 üçgen tamamla' },
  { id: 'triangles_1000',    icon: '🔱', title: 'Üçgen Tanrısı',     desc: '1000 toplam üçgen kapat',                   hint: 'Tüm oyunlarda toplamda 1000 üçgen tamamla' },

  // ── Yeni: Maç Sayısı ─────────────────────────────────────────────────
  { id: 'games_25',          icon: '🎲', title: 'Deneyimli',          desc: '25 maç oyna',                               hint: 'Toplam 25 maç tamamla (mod fark etmez)' },
  { id: 'games_50',          icon: '🏋️', title: 'Azimli',             desc: '50 maç oyna',                               hint: 'Toplam 50 maç tamamla (mod fark etmez)' },

  // ── Yeni: Seri ───────────────────────────────────────────────────────
  { id: 'win_streak_3',      icon: '🔥', title: 'Ateş Serisi',        desc: '3 maçı üst üste kazan',                    hint: 'Arka arkaya 3 maç kazan (herhangi mod)' },
  { id: 'win_streak_5',      icon: '💥', title: 'Yıkılmaz',           desc: '5 maçı üst üste kazan',                    hint: 'Arka arkaya 5 maç kazan (herhangi mod)' },

  // ── Yeni: Özel ───────────────────────────────────────────────────────
  { id: 'first_draw',        icon: '🤝', title: 'Barış Elçisi',       desc: 'İlk beraberliği yap',                      hint: 'Herhangi bir oyunu berabere bitir' },
  { id: 'online_veteran',    icon: '🌍', title: 'Online Veteran',     desc: '5 online maç kazan',                       hint: 'Çevrimiçi modda toplam 5 galibiyet al' },
  { id: 'daily_master',      icon: '📆', title: 'Günlük Usta',        desc: 'Günlük bulmacayı 3 kez tamamla',           hint: 'Günlük Bulmaca modunu 3 veya daha fazla tamamla' },
  { id: 'time_attack_expert',icon: '⚡', title: 'Hız Efsanesi',       desc: 'Zaman saldırısında 25+ üçgen',             hint: 'Zaman Saldırısı modunda 25 veya daha fazla üçgen kapat' },
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

function currentWinStreak(history = []) {
  let streak = 0;
  for (const entry of history) {
    if (entry.outcome === 'win') streak++;
    else break;
  }
  return streak;
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
    playerScore,
    opponentScore,
  } = context ?? {};

  const unlocked = [];
  function tryUnlock(id) {
    if (unlockAchievement(id)) unlocked.push(id);
  }

  const streak = currentWinStreak(stats?.history ?? []);

  // ── Mevcut ───────────────────────────────────────────────
  if (stats?.totalGames >= 1)                                           tryUnlock('first_game');
  if (stats?.wins >= 1)                                                 tryUnlock('first_win');
  if (trianglesInOneTurn >= 3)                                          tryUnlock('hat_trick');
  if (mode === 'vsAI' && difficulty === 'hard'   && gameResult === 'win') tryUnlock('beat_hard');
  if (mode === 'online' && gameResult === 'win')                        tryUnlock('online_win');
  if (stats?.totalGames >= 10)                                          tryUnlock('veteran');
  if (stats?.totalTriangles >= 100)                                     tryUnlock('century');
  if (powerUsed)                                                        tryUnlock('power_use');
  if (dailyDone)                                                        tryUnlock('daily_done');
  if (tournamentWon)                                                    tryUnlock('champion');
  if (timeAttackScore >= 15)                                            tryUnlock('speed');
  if (layout === 'grid' && gameResult === 'win')                        tryUnlock('grid_win');

  // ── Yeni: Yapay Zeka ─────────────────────────────────────
  if (mode === 'vsAI' && difficulty === 'easy'   && gameResult === 'win') tryUnlock('beat_easy');
  if (mode === 'vsAI' && difficulty === 'medium' && gameResult === 'win') tryUnlock('beat_medium');
  if ((stats?.vsAIWins?.easy ?? 0) >= 1 &&
      (stats?.vsAIWins?.medium ?? 0) >= 1 &&
      (stats?.vsAIWins?.hard ?? 0) >= 1)                                tryUnlock('ai_destroyer');

  // ── Yeni: Skor / Üçgen ───────────────────────────────────
  if (trianglesInOneTurn >= 5)                                          tryUnlock('hat_trick_plus');
  if ((playerScore ?? 0) >= 15)                                         tryUnlock('dominator');
  if ((playerScore ?? 0) >= 20)                                         tryUnlock('big_game');
  if (gameResult === 'win' && (opponentScore ?? -1) === 0)              tryUnlock('iron_wall');
  if (stats?.totalTriangles >= 50)                                      tryUnlock('triangles_50');
  if (stats?.totalTriangles >= 500)                                     tryUnlock('triangles_500');
  if (stats?.totalTriangles >= 1000)                                    tryUnlock('triangles_1000');

  // ── Yeni: Maç Sayısı ─────────────────────────────────────
  if (stats?.totalGames >= 25)                                          tryUnlock('games_25');
  if (stats?.totalGames >= 50)                                          tryUnlock('games_50');

  // ── Yeni: Seri ───────────────────────────────────────────
  if (streak >= 3)                                                      tryUnlock('win_streak_3');
  if (streak >= 5)                                                      tryUnlock('win_streak_5');

  // ── Yeni: Özel ───────────────────────────────────────────
  if (stats?.draws >= 1)                                                tryUnlock('first_draw');
  if ((stats?.modes?.online?.wins ?? 0) >= 5)                          tryUnlock('online_veteran');
  if ((stats?.modes?.daily?.played ?? 0) >= 3)                         tryUnlock('daily_master');
  if (timeAttackScore >= 25)                                            tryUnlock('time_attack_expert');

  return unlocked;
}
