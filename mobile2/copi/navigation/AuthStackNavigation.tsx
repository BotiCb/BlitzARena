import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import LoginScreen from 'src/screens/LoginScreen';


const AuthStack = createNativeStackNavigator();

const AuthStackNavigation = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name='LoginScreen' component={LoginScreen} />
    </AuthStack.Navigator>
  );
};

export default AuthStackNavigation;
