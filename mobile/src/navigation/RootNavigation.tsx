import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import AppStack from './AppStackNavigation';
import AuthStackNavigation from './AuthStackNavigation';
import { RootStackParamList } from './types';

import { useAuth } from '~/contexts/AuthContext';
import SplashScreen from '~/screens/SplashScreen';
import { ImageBackground } from 'react-native';

const RootStack = createStackNavigator<RootStackParamList>();

const RootNavigation = () => {
  const { isLoading, isLoggedIn } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {isLoggedIn ? (
            <RootStack.Screen name="AppStack" component={AppStack} />
          ) : (
            <RootStack.Screen name="AuthStack" component={AuthStackNavigation} />
          )}
        </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigation;
