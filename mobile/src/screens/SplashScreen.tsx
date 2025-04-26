import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ImageBackground } from 'react-native';
import NeonText from '~/atoms/NeonText';
import { NEON_COLOR } from '~/utils/constants/constants';

const SplashScreen = () => (
  <ImageBackground
    source={require('../../assets/ui/backgrounds/background.png')}
    style={{ flex: 1 }}
    resizeMode="stretch">
    <View style={styles.container}>
      <NeonText>Loading...</NeonText>
      <ActivityIndicator size="large" color={NEON_COLOR} />
    </View>
  </ImageBackground>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default SplashScreen;
