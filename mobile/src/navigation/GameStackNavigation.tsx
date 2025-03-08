import { useRoute, RouteProp } from '@react-navigation/native';
import React from 'react';
import { Text } from 'react-native';

import { AppStackParamList } from './types';

import { GameProvider, useGame } from '~/contexts/GameContext';
import { GamerRoomScreen } from '~/screens/GameRoomScreen';
import { LobbyScreen } from '~/screens/LobbyScreen';
import ModelTrainingScreen from '~/screens/ModelTrainingScreen';
import SplashScreen from '~/screens/SplashScreen';
import InMatchScreen from '~/screens/InMatchScreen';
import { DetectionProvider } from '~/contexts/DetectionContexts';
import { MatchProvider } from '~/contexts/MatchContext';

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
            return (
              <DetectionProvider>
                <ModelTrainingScreen />
              </DetectionProvider>
            );
          case 'game-room':
            return <GamerRoomScreen />;
          case 'match':
            return (
              <DetectionProvider>
                  <MatchProvider>
                    <InMatchScreen />
                  </MatchProvider>
              </DetectionProvider>
            );
          default:
            return (
              <SplashScreen />
            );
        }
      })()}
    </>
  );
};

export default GameStack;
