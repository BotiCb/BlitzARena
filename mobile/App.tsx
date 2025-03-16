import React, { useEffect } from 'react';
import 'react-native-gesture-handler';
import { useCameraPermission } from 'react-native-vision-camera';

import { AuthProvider } from '~/contexts/AuthContext';
import RootNavigation from '~/navigation/RootNavigation';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import { Platform, StatusBar } from 'react-native';

export default function App() {
  const { hasPermission, requestPermission } = useCameraPermission();
  if (!hasPermission) {
    requestPermission();
  }


  useEffect(() => {
    if (Platform.OS === 'android') {
      SystemNavigationBar.immersive();
      SystemNavigationBar.setNavigationColor('transparent');
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor('transparent');
    }
  }, []);

  
  return (
    <AuthProvider>
      <RootNavigation />
    </AuthProvider>
  );
}
