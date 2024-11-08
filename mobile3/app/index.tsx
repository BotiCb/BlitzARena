import InMatchView from '@/views/InMatchView';
import { Image, StyleSheet, Platform, View } from 'react-native';
import { useCameraPermissions } from 'expo-camera';

export default function HomeScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  if(!permission?.granted){
    requestPermission();
  }
  return (
    <View style={{ flex: 1 }}>
      <InMatchView/>
    </View>

  )
}

