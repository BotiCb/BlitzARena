import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';

import AppStack from './AppStackNavigation';
import AuthStackNavigation from './AuthStackNavigation';
import { RootStackTypes } from './types';

import { useAuth } from '~/contexts/AuthContext';
import SplashScreen from '~/screens/SplashScreen';
import AuthService from '~/services/AuthService';

const RootStack = createStackNavigator<RootStackTypes>();

const RootNavigation = () => {
  const { isLoading, isLoggedIn } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator>
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
