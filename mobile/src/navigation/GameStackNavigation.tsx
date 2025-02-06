import { useRoute, RouteProp } from '@react-navigation/native';
import React from 'react';

import { AppStackParamList } from './types';

import { GameProvider, useGame } from '~/contexts/GameContext';
import { LobbyScreen } from '~/screens/LobbyScreen';
import SplashScreen from '~/screens/SplashScreen';

const GameStack = () => {
  const route = useRoute<RouteProp<AppStackParamList, 'GameStack'>>();
  const { gameId, userSessionId } = route.params;

  return (
    <GameProvider gameId={gameId} userSessionId={userSessionId}>
      <GameContent />
    </GameProvider>
  );
};

const GameContent = () => {
  const { gamePhase } = useGame();

  switch (gamePhase) {
    case 'lobby':
      return <LobbyScreen />;
    default:
      return <SplashScreen />;
  }
};

export default GameStack;
