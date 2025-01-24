import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import LobbyStackNavigation from './LobbyStackNavigation';
import { AppStackParamList } from './types';

import HomeScreen from '~/screens/HomeScreen';

const Stack = createStackNavigator<AppStackParamList>();

const AppStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="LobbyStack" component={LobbyStackNavigation} />
    </Stack.Navigator>
  );
};

export default AppStack;
