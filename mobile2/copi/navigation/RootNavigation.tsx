import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';

import AppStack from './AppStackNavigation';
import SplashScreen from '@/app/SplashScreen';
import AuthService from 'src/services/AuthService';
import AuthStackNavigation from '../AuthStackNavigation';
import { RootStackTypes } from './types';

const RootStack = createStackNavigator<RootStackTypes>();

const RootNavigation = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const loggedIn = await AuthService.isLoggedIn();
      setIsLoggedIn(loggedIn);
      setIsLoading(false);
    };
    checkLoginStatus();
  }, []);

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
