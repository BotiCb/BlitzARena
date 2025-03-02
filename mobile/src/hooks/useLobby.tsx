import { useState, useEffect } from 'react';

import { useGame } from '~/contexts/GameContext';
import { LobbyWebSocketService } from '~/services/websocket/lobby.websocket.service';

export const useLobby = () => {
  const { players, playerHandlerFunction, ready, handleReadyPress } = useGame();
  const [isEveryOneReady, setIsEveryOneReady] = useState(false);
  const lobbywebsocketService = LobbyWebSocketService.getInstance();

  

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
    lobbywebsocketService.readyForPhase();

    return () => {
      lobbywebsocketService.close();
    };
  }, []);

  return { handleReadyPress, ready, isEveryOneReady };
};
