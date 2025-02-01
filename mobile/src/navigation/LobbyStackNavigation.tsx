import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import { LobbyStackParamList } from './types';

import GameSetupScreen from '~/screens/GameSetupScreen';

const Stack = createStackNavigator<LobbyStackParamList>();

const LobbyStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CreateLobby" component={GameSetupScreen} />
    </Stack.Navigator>
  );
};

export default LobbyStack;
