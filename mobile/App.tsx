import React, { useEffect } from 'react';
import 'react-native-gesture-handler';
import { useCameraPermission } from 'react-native-vision-camera';

import { AuthProvider } from '~/contexts/AuthContext';
import RootNavigation from '~/navigation/RootNavigation';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import { ImageBackground, Platform, StatusBar } from 'react-native';
import { useFonts, Poppins_500Medium_Italic } from '@expo-google-fonts/poppins';
import { Provider as PaperProvider } from 'react-native-paper';

export default function App() {
  const { hasPermission, requestPermission } = useCameraPermission();
  if (!hasPermission) {
    requestPermission();
  }

  const [fontsLoaded] = useFonts({
    Poppins_500Medium_Italic,
  });

  useEffect(() => {
    if (Platform.OS === 'android') {
      SystemNavigationBar.immersive();
      SystemNavigationBar.setNavigationColor('transparent');
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor('transparent');
    }
  }, []);

  return (
    <ImageBackground
      source={require('./assets/ui/background.png')}
      style={{ flex: 1 }}
      resizeMode="cover">
      <AuthProvider>
        <PaperProvider>
          <RootNavigation />
        </PaperProvider>
      </AuthProvider>
    </ImageBackground>
  );
}
