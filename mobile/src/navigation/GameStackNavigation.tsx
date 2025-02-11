import { useRoute, RouteProp } from '@react-navigation/native';
import React from 'react';
import { Text } from 'react-native';

import { AppStackParamList } from './types';

import { GameProvider, useGame } from '~/contexts/GameContext';
import { LobbyScreen } from '~/screens/LobbyScreen';
import ModelTrainingScreen from '~/screens/ModelTrainingScreen';
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
  const { gamePhase, ping } = useGame();
  return (
    <>
      <Text>{ping}</Text>
      {(() => {
        switch (gamePhase) {
          case 'lobby':
            return <LobbyScreen />;
          case 'training':
            return <ModelTrainingScreen />;
          default:
            return <SplashScreen />;
        }
      })()}
    </>
  );
};

export default GameStack;
