import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import GameStackNavigation from './GameStackNavigation';
import { AppStackParamList } from './types';

import GameSetupScreen from '~/screens/GameSetupScreen';
import HomeScreen from '~/screens/HomeScreen';
import { JoinGameScreen } from '~/screens/JoinGameScreen';

const Stack = createStackNavigator<AppStackParamList>();

const AppStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="CreateGame" component={GameSetupScreen} />
      <Stack.Screen name="GameStack" component={GameStackNavigation} />
      <Stack.Screen name="JoinGame" component={JoinGameScreen} />
    </Stack.Navigator>
  );
};

export default AppStack;
