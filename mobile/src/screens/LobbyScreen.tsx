import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import SplashScreen from './SplashScreen';

import { PlayerListComponent } from '~/components/PlayerListComponent';
import { useGame } from '~/contexts/GameContext';
import { useLobby } from '~/hooks/useLobby';

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
    <View style={styles.container}>
      <QRCode value={'Game ID: ' + gameId} size={250} />
      <PlayerListComponent
        players={players}
        areYouHost={areYouHost}
        onSetAsHost={setPlayerAsHost}
        yourSessionId={userSessionId}
        onRemovePlayer={onRemovePlayer}
      />
      <Button onPress={handleReadyPress} title={ready ? 'Not Ready' : 'Ready'} />
      {isEveryOneReady && areYouHost && (
        <Button title="Start Game" onPress={onStartNextGamePhase} />
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});