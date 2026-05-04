import { AppProvider, useApp } from './context/AppContext';
import MainMenu     from './components/Menu/MainMenu';
import GameSetup    from './components/Menu/GameSetup';
import GamePage     from './components/Game/GamePage';
import StatsPanel   from './components/Stats/StatsPanel';
import FriendsPanel from './components/Friends/FriendsPanel';
import OnlineLobby  from './components/Online/OnlineLobby';

function AppContent() {
  const { page } = useApp();
  return (
    <>
      {page === 'menu'    && <MainMenu />}
      {page === 'setup'   && <GameSetup />}
      {page === 'game'    && <GamePage />}
      {page === 'stats'   && <StatsPanel />}
      {page === 'friends' && <FriendsPanel />}
      {page === 'online'  && <OnlineLobby />}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
