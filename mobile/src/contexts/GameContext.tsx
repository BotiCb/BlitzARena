import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { GameStackParamList } from '~/navigation/types';
import { GameWebSocketService } from '~/services/websocket/game.websocket.service';
import { WebSocketService } from '~/services/websocket/websocket.service';
import { Player } from '~/utils/models';

type GameContextType = {
  gamePhase: string;
  gameId: string;
  userSessionId: string;
  players: Player[];
  gameWebsocketService: GameWebSocketService;
  areYouHost: boolean;
  ping: number;
  playerHandlerFunction: (players: Player[]) => void;
  setPlayerAsHost: (playerId: string) => void;
  onRemovePlayer: (playerId: string) => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{
  gameId: string;
  userSessionId: string;
  children: React.ReactNode;
}> = ({ gameId, userSessionId, children }) => {
  const websocketService = WebSocketService.getInstance();
  const gameWebsocketService = GameWebSocketService.getInstance();
  const [gamePhase, setGamePhase] = useState<string>('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [areYouHost, setAreYouHost] = useState<boolean>(false);
  const [ping, setPing] = useState<number>(0);
  const navigation = useNavigation<StackNavigationProp<GameStackParamList>>();

  const setPlayerAsHost = (playerId: string) => {
    if (!areYouHost) {
      return;
    }
    gameWebsocketService.setPlayerAsHost(playerId);
  };

  const onRemovePlayer = (playerId: string) => {
    if (!areYouHost) {
      return;
    }
    gameWebsocketService.removePlayer(playerId);
  };

  useEffect(() => {
    gameWebsocketService.setPlayersHandlerFunction(setPlayers);
    gameWebsocketService.setPingHandlerFunction(setPing);
    gameWebsocketService.setGamePhaseHandlerFunction(setGamePhase);
    gameWebsocketService.setGameId(gameId);
    gameWebsocketService.setSessionId(userSessionId);
    gameWebsocketService.setAreYouHostHandlerFunction(setAreYouHost);
    gameWebsocketService.setNavigationHandler(navigation);
    gameWebsocketService.setWebSocketEventListeners();
    websocketService.connect(gameId, userSessionId);

    return () => {
      gameWebsocketService.close();
    };
  }, []);
  return (
    <GameContext.Provider
      value={{
        gamePhase,
        gameId,
        userSessionId,
        gameWebsocketService,
        players,
        areYouHost,
        setPlayerAsHost,
        onRemovePlayer,
        playerHandlerFunction: setPlayers,
        ping,
      }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};
