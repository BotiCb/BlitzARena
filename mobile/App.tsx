import React from 'react';
import 'react-native-gesture-handler';
import { useCameraPermission } from 'react-native-vision-camera';

import { AuthProvider } from '~/contexts/AuthContext';
import RootNavigation from '~/navigation/RootNavigation';

export default function App() {
  const { hasPermission, requestPermission } = useCameraPermission();
  if (!hasPermission) {
    requestPermission();
  }
  return (
    <AuthProvider>
      <RootNavigation />
    </AuthProvider>
  );
}
