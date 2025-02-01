import { useRoute, RouteProp } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect } from 'react';

import { AppStackParamList, GameStackParamList } from './types';

import { GameProvider } from '~/contexts/GameContext';
import { LobbyScreen } from '~/screens/LobbyScreen';

const Stack = createStackNavigator<GameStackParamList>();

const GameStack = () => {
  const route = useRoute<RouteProp<AppStackParamList, 'GameStack'>>();
  const { gameId, userSessionId } = route.params;
  useEffect(() => {});
  return (
    <GameProvider gameId={gameId} userSessionId={userSessionId}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Lobby" component={LobbyScreen} />
      </Stack.Navigator>
    </GameProvider>
  );
};

export default GameStack;
