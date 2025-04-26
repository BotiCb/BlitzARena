import { useAppState } from '@react-native-community/hooks';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { Camera, Code, useCameraDevices, useCodeScanner } from 'react-native-vision-camera';
import NeonText from '~/atoms/NeonText';

import { AppStackParamList } from '~/navigation/types';
import { GAME_ENDPOINTS } from '~/services/restApi/Endpoints';
import { apiClient } from '~/services/restApi/RestApiService';
import { JoinGameResponseDto } from '~/services/restApi/dto/response.dto';
import { AsyncStore } from '~/services/storage/AsyncStorage';
import { NeonButton } from '~/components/NeonButton';
import { Scope } from '~/components/Scope';

export const JoinGameScreen = () => {
  const device = useCameraDevices()[0];

  const isFocused = useIsFocused();
  const appState = useAppState();

  const [isActive, setIsActive] = useState(isFocused && appState === 'active');
  const [isScanning, setIsScanning] = useState(true);
  const [error, setError] = useState('');

  const navigation = useNavigation<StackNavigationProp<AppStackParamList, 'JoinGame'>>();

  const handleCodeScanned = async (codes: Code[]) => {
    if (codes[0].value?.startsWith('Game ID: ') && isScanning) {
      try {
        setIsScanning(false);
        const gameId = codes[0].value.slice(9);
        setIsActive(false);
        const response: JoinGameResponseDto = (await apiClient.post(GAME_ENDPOINTS.JOIN(gameId)))
          .data;
        navigation.navigate('GameStack', {
          gameId,
          userSessionId: response.sessionId,
        });
      } catch (err: any) {
        setIsActive(true);
        setIsScanning(true);
        setError(err.response.data.message);
      }
    }
  };

  const handleJoinPreviousGame = async () => {
    try {
      setIsScanning(false);
      setIsActive(false);
      const gameId = await AsyncStore.getItemAsync('lastGameId');
      if (!gameId) {
        setError('No previous game found');
        return;
      }
      const response: JoinGameResponseDto = (await apiClient.post(GAME_ENDPOINTS.JOIN(gameId)))
        .data;
      navigation.navigate('GameStack', {
        gameId,
        userSessionId: response.sessionId,
      });
    } catch (err: any) {
      setIsActive(true);
      setIsScanning(true);
      setError(err.response.data.message);
    }
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],
    onCodeScanned: handleCodeScanned,
  });

  return (
    <View style={styles.container}>
      <Camera device={device} isActive={isActive} style={styles.camera} codeScanner={codeScanner} />
      <NeonText>Scan the QR code to join a game</NeonText>
      <View style={{ marginTop: '135%' }}>
        <NeonButton title="Join to previous game" onPress={handleJoinPreviousGame} />
      </View>
      <NeonText style={{ color: 'red' }}>{error}</NeonText>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  camera: {
    flex: 1,

    justifyContent: 'center',

    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
    zIndex: -1,
  },
});
