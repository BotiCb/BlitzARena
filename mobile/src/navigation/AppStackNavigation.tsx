import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import { AppStackParamList } from './types';

import HomeScreen from '~/screens/HomeScreen';
import GameSetupScreen from '~/screens/GameSetupScreen';

const Stack = createStackNavigator<AppStackParamList>();

const AppStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="CreateGame" component={GameSetupScreen} />
    </Stack.Navigator>
  );
};

export default AppStack;
