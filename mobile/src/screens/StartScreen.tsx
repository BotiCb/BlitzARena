import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ImageBackground } from 'react-native';
import NeonText from '~/atoms/NeonText';
import { ApiUrlModal } from '~/components/ApiUrlModal';
import { AsyncStore } from '~/services/storage/AsyncStorage';
import { NEON_COLOR } from '~/utils/constants/constants';

export interface StartScreenProps {
  handleOk: () => void;
}

const StartScreen = ({ handleOk }: StartScreenProps) => (
  <ImageBackground
    source={require('../../assets/ui/backgrounds/background.png')}
    style={{ flex: 1 }}
    resizeMode="stretch">
    <View style={styles.container}>
      <NeonText>Loading...</NeonText>
      <ActivityIndicator size="large" color={NEON_COLOR} />
    </View>
    <ApiUrlModal 
    storage={AsyncStore}
    onClose={handleOk}
    />
  </ImageBackground>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default StartScreen;
