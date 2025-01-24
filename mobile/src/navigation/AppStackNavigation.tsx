import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import { AppStackParamList } from './types';

import HomeScreen from '~/screens/HomeScreen';
import LobbySetupScreen from '~/screens/LobbySetupScreen';

const Stack = createStackNavigator<AppStackParamList>();

const AppStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="CreateLobby" component={LobbySetupScreen} />
    </Stack.Navigator>
  );
};

export default AppStack;
