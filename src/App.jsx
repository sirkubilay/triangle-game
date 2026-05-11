import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import MainMenu          from './components/Menu/MainMenu';
import GameSetup         from './components/Menu/GameSetup';
import GamePage          from './components/Game/GamePage';
import StatsPanel        from './components/Stats/StatsPanel';
import FriendsPanel      from './components/Friends/FriendsPanel';
import OnlineLobby       from './components/Online/OnlineLobby';
import SplashScreen      from './components/UI/SplashScreen';
import AchievementsPanel from './components/Achievements/AchievementsPanel';
import ProfilePanel      from './components/Profile/ProfilePanel';

function AppContent() {
  const { page } = useApp();
  return (
    <>
      {page === 'menu'         && <MainMenu />}
      {page === 'setup'        && <GameSetup />}
      {page === 'game'         && <GamePage />}
      {page === 'stats'        && <StatsPanel />}
      {page === 'friends'      && <FriendsPanel />}
      {page === 'online'       && <OnlineLobby />}
      {page === 'achievements' && <AchievementsPanel />}
      {page === 'profile'      && <ProfilePanel />}
    </>
  );
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false);
  return (
    <AppProvider>
      <AppContent />
      {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
    </AppProvider>
  );
}
