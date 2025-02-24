import React from 'react';
import { View, Button, Text } from 'react-native';

import SplashScreen from './SplashScreen';

import { PlayerListComponent } from '~/components/PlayerListComponent';
import { useGame } from '~/contexts/GameContext';
import { useGameRoom } from '~/hooks/useGameRoom';

export const GamerRoomScreen = () => {
  const {
    players,
    areYouHost,
    setPlayerAsHost,
    userSessionId,
    onRemovePlayer,
    onStartNextGamePhase,
    model,
    trainingProgress,
    isPhaseInfosNeeded,
  } = useGame();

  const { handleReadyPress, ready, isEveryOneReady } = useGameRoom();

  if (isPhaseInfosNeeded) {
    return <SplashScreen />;
  }
  return (
    <View>
      {trainingProgress !== null && <Text>Training Progress: {trainingProgress}</Text>}
      <PlayerListComponent
        players={players}
        areYouHost={areYouHost}
        onSetAsHost={setPlayerAsHost}
        yourSessionId={userSessionId}
        onRemovePlayer={onRemovePlayer}
      />
      {model && <Button onPress={handleReadyPress} title={ready ? 'Not Ready' : 'Ready'} />}
      {isEveryOneReady && areYouHost && (
        <Button title="Start Game" onPress={onStartNextGamePhase} />
      )}
    </View>
  );
};
