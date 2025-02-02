import React, { createContext, useContext, useEffect, useState } from 'react';

import { GameWebSocketService } from '~/services/websocket/game.websocket.service';
import { WebSocketService } from '~/services/websocket/websocket.service';
import { Player } from '~/utils/models';

type GameContextType = {
  gameId: string;
  userSessionId: string;
  players: Player[];
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
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    gameWebsocketService.setWebSocketEventListeners();
    gameWebsocketService.setPlayersHandlerFunction(setPlayers);
    gameWebsocketService.setGameId(gameId);

    websocketService.connect(gameId, userSessionId);

    return () => {
      websocketService.close();
    };
  }, []);
  return (
    <GameContext.Provider value={{ gameId, userSessionId, gameWebsocketService, players }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};
