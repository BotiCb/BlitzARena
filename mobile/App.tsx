// App.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import TensorCameraView from './src/components/views/TensorCameraView';
import InbattleScreen from './src/screens/inbattle';

const App = () => {
  return (
    <View style={styles.container}>
      <InbattleScreen />
       
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;