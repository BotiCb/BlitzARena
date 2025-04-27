import React, { useEffect } from 'react';
import 'react-native-gesture-handler';
import { useCameraPermission } from 'react-native-vision-camera';
import { useKeepAwake } from 'expo-keep-awake';


import { AuthProvider } from '~/contexts/AuthContext';
import RootNavigation from '~/navigation/RootNavigation';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import { ImageBackground, Platform, StatusBar } from 'react-native';
import { useFonts, Poppins_500Medium_Italic,  Poppins_500Medium } from '@expo-google-fonts/poppins';
import { Provider as PaperProvider } from 'react-native-paper';
import * as Font from 'expo-font';


export default function App() {
  const { hasPermission, requestPermission } = useCameraPermission();
  if (!hasPermission) {
    requestPermission();
  }

  const [fontsLoaded] = useFonts({
    Poppins_500Medium_Italic, Poppins_500Medium, 'Orbitron-Regular' : require('./assets/ui/fonts/Orbitron/static/Orbitron-SemiBold.ttf'),

  });

  useKeepAwake();

  useEffect(() => {
    // if (Platform.OS === 'android') {
    //   SystemNavigationBar.immersive();
    //   SystemNavigationBar.setNavigationColor('transparent');
    //   StatusBar.setTranslucent(true);
    //   StatusBar.setBackgroundColor('transparent');
    // }
  }, []);

  return (
    <ImageBackground
      source={require('./assets/ui/backgrounds/background.png')}
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
