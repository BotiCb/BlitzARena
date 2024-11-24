import CameraView from '@/components/CameraView';
import InMatchScreen from '@/screens/InMatchScreen';
import ModelTrainingScreen from '@/screens/ModelTrainingScreen';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';


export default function HomeScreen() {
  return (
    <View style={{ flex: 1 }}>
      <InMatchScreen />
      {/* <ModelTrainingScreen /> */}
    </View>
  );
}

const styles = StyleSheet.create({
 
});
