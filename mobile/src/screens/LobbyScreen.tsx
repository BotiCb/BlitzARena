import React, { useEffect, useState } from 'react';
import { View, Button, Text } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { PlayerListComponent } from '~/components/PlayerListComponent';
import { useGame } from '~/contexts/GameContext';
import { LobbyWebSocketService } from '~/services/websocket/lobby.websocket.service';

export const LobbyScreen = () => {
  const {
    gameId,
    players,
    areYouHost,
    setPlayerAsHost,
    userSessionId,
    onRemovePlayer,
    playerHandlerFunction,
    onStartNextGamePhase,
  } = useGame();

  const [ready, setReady] = useState(false);
  const [isEveryOneReady, setIsEveryOneReady] = useState(false);

  const lobbywebsocketService = LobbyWebSocketService.getInstance();

  const handleReadyPress = () => {
    lobbywebsocketService.setMyStatus(!ready);
  };

  useEffect(() => {
    if (players.every((player) => player.isReady)) {
      setIsEveryOneReady(true);
    } else {
      setIsEveryOneReady(false);
    }
  }, [players]);

  useEffect(() => {
    lobbywebsocketService.setWebSocketEventListeners();
    lobbywebsocketService.setPlayersHandlerFunction(playerHandlerFunction);
    lobbywebsocketService.setReadyHandlerFunction(setReady);

    return () => {
      lobbywebsocketService.close();
    };
  }, []);
  return (
    <View>
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
