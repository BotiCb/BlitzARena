import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useState } from 'react';

import AppStack from './AppStackNavigation';
import AuthStackNavigation from './AuthStackNavigation';
import { RootStackParamList } from './types';

import { useAuth } from '~/contexts/AuthContext';
import SplashScreen from '~/screens/SplashScreen';
import { ImageBackground } from 'react-native';
import StartScreen from '~/screens/StartScreen';

const RootStack = createStackNavigator<RootStackParamList>();

const RootNavigation = () => {
  const { isLoading, isLoggedIn } = useAuth();
  const [isOk, setIsOk] = useState(false);

  if (isLoading || !isOk) {
    return <StartScreen handleOk={() => setIsOk(true)} />;
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
