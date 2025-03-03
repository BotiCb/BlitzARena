import { useEffect, useState } from 'react';

import useCoordinates from './useCoordinates';

import { useGame } from '~/contexts/GameContext';
import { GameRoomWebSocketService } from '~/services/websocket/game-room.websocket.service';
import { GameArea, TEAM } from '~/utils/types/types';

export const useGameRoom = () => {
  const { players, playerHandlerFunction, ready, handleReadyPress } = useGame();
  const [isEveryOneReady, setIsEveryOneReady] = useState(false);
  const [gameArea, setGameArea] = useState<GameArea | null>(null);

  const { location } = useCoordinates({
    keepRefreshing: true,
    refreshTimeInterval: 5000,
    options: {
      accuracy: 5,
      timeInterval: 1000,
      distanceInterval: 0,
    },
  });

  const gameRoomWebsocketService = GameRoomWebSocketService.getInstance();

  const onGameAreaChange = (gameArea: GameArea) => {
    gameRoomWebsocketService.sendGameArea(gameArea);
  };

  useEffect(() => {
    if (location) {
      gameRoomWebsocketService.sendPlayersLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    }
  }, [location]);

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
    gameRoomWebsocketService.setGameAreaHandlerFunction(setGameArea);
    gameRoomWebsocketService.readyForPhase();

    return () => {
      gameRoomWebsocketService.close();
    };
  }, []);

  const handleTeamSelection = (team: TEAM) => {
    gameRoomWebsocketService.selectTeam(team);
  };

  return {
    handleReadyPress,
    ready,
    isEveryOneReady,
    handleTeamSelection,
    gameArea,
    onGameAreaChange,
  };
};
