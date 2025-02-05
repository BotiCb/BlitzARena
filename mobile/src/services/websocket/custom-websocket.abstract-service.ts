import { WebSocketService } from './websocket.service';

import { Player } from '~/utils/models';

export abstract class AbstractCustomWebSocketService {
  protected websocketService: WebSocketService = WebSocketService.getInstance();
  protected static playersHandlerFunction: (players: any) => void = () => {};
  protected static gamePhaseHandlerFunction: (gamePhase: string) => void = () => {};
  protected static gameId: string = '';
  protected static sessionId: string = '';

  private static instances: { [key: string]: AbstractCustomWebSocketService } = {};

  static getInstance<T extends AbstractCustomWebSocketService>(this: new () => T): T {
    if (!AbstractCustomWebSocketService.instances[this.name]) {
      AbstractCustomWebSocketService.instances[this.name] = new this();
    }
    return AbstractCustomWebSocketService.instances[this.name] as T;
  }

  setPlayersHandlerFunction = (handler: (players: Player[]) => void) => {
    AbstractCustomWebSocketService.playersHandlerFunction = handler;
  };

  setGamePhaseHandlerFunction = (handler: (gamePhase: string) => void) => {
    AbstractCustomWebSocketService.gamePhaseHandlerFunction = handler;
  };

  setGameId = (gameId: string) => {
    AbstractCustomWebSocketService.gameId = gameId;
  };

  setSessionId = (sessionId: string) => {
    AbstractCustomWebSocketService.sessionId = sessionId;
  };

  abstract setWebSocketEventListeners(): void;
  abstract close(): void;
}
