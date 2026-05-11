const PROFILE_KEY = 'tg_profile_v1';

export const EMOJIS = ['🎮','🔥','⚡','🏆','👾','🤖','🦊','🐺','🦁','🐉','🎯','💎'];

function defaultProfile() {
  return { name: 'Oyuncu', emoji: '🎮', color: '#818cf8' };
}

export function loadProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY)) ?? defaultProfile();
  } catch {
    return defaultProfile();
  }
}

export function saveProfile(p) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  } catch {}
}
