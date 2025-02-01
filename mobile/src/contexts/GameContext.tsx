import React, { createContext, useContext, useEffect } from 'react';

import { GameWebSocketService } from '~/services/websocket/game.websocket.service';
import { ModelTrainingWebSocketService } from '~/services/websocket/model-training.websocket.service';
import { WebSocketService } from '~/services/websocket/websocket.service';

type GameContextType = {
  gameId: string;
  userSessionId: string;
  gameWebsocketService: GameWebSocketService;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{
  gameId: string;
  userSessionId: string;
  children: React.ReactNode;
}> = ({ gameId, userSessionId, children }) => {
  const websocketService = WebSocketService.getInstance();
  const gameWebsocketService = GameWebSocketService.getInstance();
  const handleGameInfoEvent = (message: any) => {
    console.log(message);
  };

  useEffect(() => {
    gameWebsocketService.setGameInfoEventListener(handleGameInfoEvent);
    websocketService.connect(gameId, userSessionId);

    return () => {
      websocketService.close();
    }
  }, []);
  return (
    <GameContext.Provider value={{ gameId, userSessionId, gameWebsocketService }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};
