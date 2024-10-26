import React, { useRef, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { CameraView} from 'expo-camera';
import { Camera , CameraType} from 'expo-camera/legacy';

export default function CameraScreen() {

 

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} 
        type={CameraType.back}
        ratio="16:9"
    />
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
});