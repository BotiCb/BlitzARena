import { useEffect, useState } from 'react';

import { useGame } from '~/contexts/GameContext';
import { GameRoomWebSocketService } from '~/services/websocket/game-room.websocket.service';

export const useGameRoom = () => {
  const { players, playerHandlerFunction } = useGame();
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

  return { handleReadyPress, ready, isEveryOneReady };
};
