import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import LoginScreen from 'src/screens/LoginScreen';

import { AuthStackParamList } from './types';

import RegisterScreen from '~/screens/RegisterScreen';

const AuthStack = createStackNavigator<AuthStackParamList>();

const AuthStackNavigation = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="LoginScreen" component={LoginScreen} />
      <AuthStack.Screen name="RegisterScreen" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
};

export default AuthStackNavigation;
