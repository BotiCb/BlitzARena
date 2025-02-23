import { WebSocketMessageType } from './websocket-types';
import { WebSocketService } from './websocket.service';

import { Player } from '~/utils/models';

export abstract class AbstractCustomWebSocketService {
  protected websocketService: WebSocketService = WebSocketService.getInstance();
  protected static playersHandlerFunction: (players: any) => void = () => {};
  protected static isPhaseInfosNeededHandlerFunction: (isPhaseInfosNeeded: boolean) => void =
    () => {};
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

  setIsPhaseInfosNeededHandlerFunction = (handler: (isPhaseInfosNeeded: boolean) => void) => {
    AbstractCustomWebSocketService.isPhaseInfosNeededHandlerFunction = handler;
  };

  setGameId = (gameId: string) => {
    AbstractCustomWebSocketService.gameId = gameId;
  };

  setSessionId = (sessionId: string) => {
    AbstractCustomWebSocketService.sessionId = sessionId;
  };

  readyForPhase = async () => {
    while (!this.websocketService.isConnected()) {
      console.log('Waiting for WebSocket connection...');
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before checking again
    }
    this.websocketService.sendMessage({
      type: WebSocketMessageType.READY_FOR_PHASE,
    });
  };

  abstract setWebSocketEventListeners(): void;
  abstract close(): void;
}
