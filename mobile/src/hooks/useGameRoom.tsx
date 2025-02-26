import { useEffect, useState } from 'react';
import { LatLng } from 'react-native-maps';

import useCoordinates from './useCoordinates';

import { useGame } from '~/contexts/GameContext';
import { GameRoomWebSocketService } from '~/services/websocket/game-room.websocket.service';
import { TEAM } from '~/utils/types';

export const useGameRoom = () => {
  const { players, playerHandlerFunction } = useGame();
  const [ready, setReady] = useState(false);
  const [isEveryOneReady, setIsEveryOneReady] = useState(false);
  const [gameArea, setGameArea] = useState<LatLng[]>([]);

  const { location } = useCoordinates();

  const gameRoomWebsocketService = GameRoomWebSocketService.getInstance();

  const handleReadyPress = () => {
    gameRoomWebsocketService.setMyStatus(!ready);
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
    gameRoomWebsocketService.setReadyHandlerFunction(setReady);
    gameRoomWebsocketService.setGameAreaHandlerFunction(setGameArea);
    gameRoomWebsocketService.readyForPhase();

    return () => {
      gameRoomWebsocketService.close();
    };
  }, []);

  const handleTeamSelection = (team: TEAM) => {
    gameRoomWebsocketService.selectTeam(team);
  };

  return { handleReadyPress, ready, isEveryOneReady, handleTeamSelection, gameArea };
};
