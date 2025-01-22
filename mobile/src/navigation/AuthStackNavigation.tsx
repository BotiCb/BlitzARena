import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import LoginScreen from 'src/screens/LoginScreen';

const AuthStack = createStackNavigator();

const AuthStackNavigation = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="LoginScreen" component={LoginScreen} />
    </AuthStack.Navigator>
  );
};

export default AuthStackNavigation;
