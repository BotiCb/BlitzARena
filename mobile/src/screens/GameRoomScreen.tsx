import React, { useEffect, useState } from 'react';
import { View, Button, Text } from 'react-native';

import SplashScreen from './SplashScreen';

import { PlayerListComponent } from '~/components/PlayerListComponent';
import { useGame } from '~/contexts/GameContext';
import { GameRoomWebSocketService } from '~/services/websocket/game-room.websocket.service';

export const GamerRoomScreen = () => {
  const {
    players,
    areYouHost,
    setPlayerAsHost,
    userSessionId,
    onRemovePlayer,
    playerHandlerFunction,
    onStartNextGamePhase,
    modelReady,
    trainingProgress,
    isPhaseInfosNeeded,
  } = useGame();

  const [ready, setReady] = useState(false);
  const [isEveryOneReady, setIsEveryOneReady] = useState(false);

  const gameRoomWebsocketService = GameRoomWebSocketService.getInstance();

  const handleReadyPress = () => {
    gameRoomWebsocketService.setMyStatus(!ready);
  };

  useEffect(() => {
    if (players.every((player) => player.isReady)) {
      setIsEveryOneReady(true);
    } else {
      setIsEveryOneReady(false);
    }
  }, [players]);

  useEffect(() => {
    gameRoomWebsocketService.setWebSocketEventListeners();
    gameRoomWebsocketService.setPlayersHandlerFunction(playerHandlerFunction);
    gameRoomWebsocketService.setReadyHandlerFunction(setReady);
    gameRoomWebsocketService.readyForPhase();

    return () => {
      gameRoomWebsocketService.close();
    };
  }, []);

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
      {modelReady && <Button onPress={handleReadyPress} title={ready ? 'Not Ready' : 'Ready'} />}
      {isEveryOneReady && areYouHost && (
        <Button title="Start Game" onPress={onStartNextGamePhase} />
      )}
    </View>
  );
};
