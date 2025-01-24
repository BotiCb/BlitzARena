import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import { LobbyStackParamList } from './types';

import LobbySetupScreen from '~/screens/LobbySetupScreen';

const Stack = createStackNavigator<LobbyStackParamList>();

const LobbyStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CreateLobby" component={LobbySetupScreen} />
    </Stack.Navigator>
  );
};

export default LobbyStack;
