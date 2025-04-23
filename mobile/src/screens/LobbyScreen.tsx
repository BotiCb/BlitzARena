import React from 'react';
import { View, Button, StyleSheet, ImageBackground } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import SplashScreen from './SplashScreen';

import { PlayerListComponent } from '~/components/PlayerListComponent';
import { useGame } from '~/contexts/GameContext';
import { useLobby } from '~/hooks/useLobby';
import { NeonButton } from '~/atoms/NeonButton';

export const LobbyScreen = () => {
  const {
    gameId,
    players,
    areYouHost,
    setPlayerAsHost,
    userSessionId,
    onRemovePlayer,
    onStartNextGamePhase,
    isPhaseInfosNeeded,
  } = useGame();
  const { handleReadyPress, ready, isEveryOneReady } = useLobby();

  if (isPhaseInfosNeeded) {
    return <SplashScreen />;
  }
  return (
    <ImageBackground
    source={require('../../assets/ui/backgrounds/background.png')} // Make sure the image path is correct
    style={{ flex: 1 }}
    resizeMode="cover">
    <View style={styles.container}>
      <QRCode value={'Game ID: ' + gameId} size={250} logoBackgroundColor='transparent' color='#4bb0c2'/>
      <PlayerListComponent
        players={players}
        areYouHost={areYouHost}
        onSetAsHost={setPlayerAsHost}
        yourSessionId={userSessionId}
        onRemovePlayer={onRemovePlayer}
      />
      <NeonButton onPress={handleReadyPress} title={ready ? 'Not Ready' : 'Ready'} />
      {isEveryOneReady && areYouHost && (
        <NeonButton title="Start Game" onPress={onStartNextGamePhase} />
      )}
    </View>

    </ImageBackground>
  );
};


const styles = StyleSheet.create({
  container: {
    paddingVertical: 35,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});