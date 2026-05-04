import { createContext, useContext, useState } from 'react';
import { loadStats, loadFriends, addFriend as addFriendUtil, removeFriend as removeFriendUtil } from '../utils/storage';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [page, setPage]           = useState('menu');
  const [gameConfig, setGameConfig] = useState(null);
  const [stats, setStats]         = useState(loadStats);
  const [friends, setFriends]     = useState(loadFriends);

  function startGame(config) {
    setGameConfig(config);
    setPage('game');
  }

  function goTo(target) {
    setPage(target);
    if (target !== 'game') {
      setStats(loadStats());
      setFriends(loadFriends());
    }
  }

  function goToMenu() { goTo('menu'); }

  function addFriend(name) { setFriends(addFriendUtil(name)); }
  function removeFriend(id) { setFriends(removeFriendUtil(id)); }
  function refreshFriends() { setFriends(loadFriends()); }
  function refreshStats() { setStats(loadStats()); }

  return (
    <AppContext.Provider value={{
      page, goTo, goToMenu,
      gameConfig, startGame,
      stats, refreshStats,
      friends, addFriend, removeFriend, refreshFriends,
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
