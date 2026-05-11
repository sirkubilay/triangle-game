import { createContext, useContext, useState, useEffect } from 'react';
import { loadStats, loadFriends, addFriend as addFriendUtil, removeFriend as removeFriendUtil } from '../utils/storage';
import { loadProfile, saveProfile as saveProfileUtil } from '../utils/profile';
import { loadAchievements, unlockAchievement as unlockAchievementUtil, ACHIEVEMENTS } from '../utils/achievements';

const AppContext = createContext(null);

const THEMES = ['gece', 'buz', 'alev', 'orman', 'safak'];

function readUrlRoom() {
  const p = new URLSearchParams(window.location.search).get('room');
  if (p) window.history.replaceState({}, '', window.location.pathname);
  return p || '';
}

export function AppProvider({ children }) {
  const [page, setPage]             = useState('menu');
  const [gameConfig, setGameConfig] = useState(null);
  const [stats, setStats]           = useState(loadStats);
  const [friends, setFriends]       = useState(loadFriends);
  const [theme, setThemeState]      = useState(() => localStorage.getItem('theme') || 'gece');
  const [initialRoomCode]           = useState(readUrlRoom);
  const [profile, setProfileState]  = useState(loadProfile);
  const [achievements, setAchievements] = useState(loadAchievements);
  const [tournament, setTournament] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  function cycleTheme() {
    const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
    localStorage.setItem('theme', next);
    setThemeState(next);
  }

  function setProfile(p) {
    saveProfileUtil(p);
    setProfileState(p);
  }

  function unlockAchievement(id) {
    const isNew = unlockAchievementUtil(id);
    if (isNew) {
      setAchievements(loadAchievements());
    }
    return isNew;
  }

  function startGame(config) { setGameConfig(config); setPage('game'); }

  function goTo(target) {
    setPage(target);
    if (target !== 'game') { setStats(loadStats()); setFriends(loadFriends()); }
  }

  function goToMenu() { goTo('menu'); }
  function addFriend(name) { setFriends(addFriendUtil(name)); }
  function removeFriend(id) { setFriends(removeFriendUtil(id)); }
  function refreshFriends() { setFriends(loadFriends()); }
  function refreshStats() { setStats(loadStats()); }

  // Tournament logic
  function startTournament(players) {
    // players: array of 4 names
    const t = {
      players,
      matches: [
        { p1: players[0], p2: players[1], winner: null }, // semi1
        { p1: players[2], p2: players[3], winner: null }, // semi2
        { p1: null, p2: null, winner: null },              // final
      ],
      phase: 'semi1',
    };
    setTournament(t);
    return t;
  }

  function advanceTournament(winnerName) {
    setTournament(prev => {
      if (!prev) return prev;
      const matches = prev.matches.map(m => ({ ...m }));

      if (prev.phase === 'semi1') {
        matches[0].winner = winnerName;
        return { ...prev, matches, phase: 'semi2' };
      } else if (prev.phase === 'semi2') {
        matches[1].winner = winnerName;
        // Setup final
        matches[2].p1 = matches[0].winner;
        matches[2].p2 = matches[1].winner;
        return { ...prev, matches, phase: 'final' };
      } else if (prev.phase === 'final') {
        matches[2].winner = winnerName;
        return { ...prev, matches, phase: 'done' };
      }
      return prev;
    });
  }

  return (
    <AppContext.Provider value={{
      page, goTo, goToMenu,
      gameConfig, startGame,
      stats, refreshStats,
      friends, addFriend, removeFriend, refreshFriends,
      theme, cycleTheme,
      initialRoomCode,
      profile, setProfile,
      achievements, unlockAchievement,
      tournament, startTournament, advanceTournament, setTournament,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
