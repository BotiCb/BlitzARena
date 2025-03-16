import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { GameStackParamList } from '~/navigation/types';
import { AsyncStore } from '~/services/storage/AsyncStorage';
import { GameWebSocketService } from '~/services/websocket/game.websocket.service';
import { WebSocketService } from '~/services/websocket/websocket.service';
import { Player } from '~/utils/models';
import { GamePhase, Model } from '~/utils/types/types';

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
  isPhaseInfosNeeded: boolean;
  model: Model | null;
  trainingProgress: number;
  ready: boolean;
  handleReadyPress: () => void;
  errorMsg: string;
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
  const [isPhaseInfosNeeded, setIsPhaseInfosNeeded] = useState<boolean>(true);
  const [model, setModel] = useState<Model | null>(null);
  const [ready, setReady] = useState<boolean>(false);
  const [trainingProgress, setTrainingProgress] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>('');
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

  const handleReadyPress = () => {
    gameWebsocketService.setMyStatus(!ready);
  };

  let timeoutId: NodeJS.Timeout | null  = null;
  useEffect(() => {
    if (timeoutId !== null) {
    clearTimeout(timeoutId);
  }
  setErrorMsg(errorMsg);
  timeoutId = setTimeout(() => {
    setErrorMsg('');
    timeoutId = null;
  }, 5000);
  }, [errorMsg]);


  useEffect(() => {
    gameWebsocketService.setNavigationHandler(navigation);
  }, [navigation]);
  useEffect(() => {
    AsyncStore.setItemAsync('lastGameId', gameId);
    gameWebsocketService.setPlayersHandlerFunction(setPlayers);
    gameWebsocketService.setPingHandlerFunction(setPing);
    gameWebsocketService.setGamePhaseHandlerFunction(setGamePhase);
    gameWebsocketService.setGameId(gameId);
    gameWebsocketService.setSessionId(userSessionId);
    gameWebsocketService.setAreYouHostHandlerFunction(setAreYouHost);
    gameWebsocketService.setNavigationHandler(navigation);
    gameWebsocketService.setModelHandlerFunction(setModel);
    gameWebsocketService.setTrainingProgressHandlerFunction(setTrainingProgress);
    gameWebsocketService.setIsPhaseInfosNeededHandlerFunction(setIsPhaseInfosNeeded);
    gameWebsocketService.setReadyHandlerFunction(setReady);
    gameWebsocketService.setErrorMsgHandlerFunction(setErrorMsg);
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
        isPhaseInfosNeeded,
        model,
        trainingProgress,
        ready,
        handleReadyPress,
        errorMsg,
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
