import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { GameStackParamList } from '~/navigation/types';
import { GameWebSocketService } from '~/services/websocket/game.websocket.service';
import { WebSocketService } from '~/services/websocket/websocket.service';
import { Player } from '~/utils/models';
import { GamePhase } from '~/utils/types';

type GameContextType = {
  gamePhase: GamePhase;
  gameId: string;
  userSessionId: string;
  players: Player[];
  gameWebsocketService: GameWebSocketService;
  areYouHost: boolean;
  ping: number;
  playerHandlerFunction: (players: Player[]) => void;
  setPlayerAsHost: (playerId: string) => void;
  onRemovePlayer: (playerId: string) => void;
  onStartNextGamePhase: () => void;
  trainingProgress: number | null;
  modelReady: boolean;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{
  gameId: string;
  userSessionId: string;
  children: React.ReactNode;
}> = ({ gameId, userSessionId, children }) => {
  const websocketService = WebSocketService.getInstance();
  const gameWebsocketService = GameWebSocketService.getInstance();
  const [gamePhase, setGamePhase] = useState<GamePhase>('lobby');
  const [players, setPlayers] = useState<Player[]>([]);
  const [areYouHost, setAreYouHost] = useState<boolean>(false);
  const [ping, setPing] = useState<number>(0);
  const navigation = useNavigation<StackNavigationProp<GameStackParamList>>();
  const [modelReady, setModelReady] = useState<boolean>(false);
  const [trainingProgress, setTrainingProgress] = useState<number | null>(null);

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

  const onStartNextGamePhase = () => {
    if (!areYouHost) {
      return;
    }
    gameWebsocketService.startNextGamePhase();
  };
  useEffect(() => {
    gameWebsocketService.setNavigationHandler(navigation);
  }, [navigation]);
  useEffect(() => {
    gameWebsocketService.setPlayersHandlerFunction(setPlayers);
    gameWebsocketService.setPingHandlerFunction(setPing);
    gameWebsocketService.setGamePhaseHandlerFunction(setGamePhase);
    gameWebsocketService.setGameId(gameId);
    gameWebsocketService.setSessionId(userSessionId);
    gameWebsocketService.setAreYouHostHandlerFunction(setAreYouHost);
    gameWebsocketService.setNavigationHandler(navigation);
    gameWebsocketService.setModelReadyHandlerFunction(setModelReady);
    gameWebsocketService.setTrainingProgressHandlerFunction(setTrainingProgress);
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
        onStartNextGamePhase,
        modelReady,
        trainingProgress,
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
