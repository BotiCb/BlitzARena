import { AbstractCustomWebSocketService } from './custom-websocket.abstract-service';
import { WebSocketMessageType, WebSocketMsg } from './websocket-types';

import { Player } from '~/utils/models';

export class GameRoomWebSocketService extends AbstractCustomWebSocketService {
  private readyHandlerFunction: (isReady: boolean) => void = () => {};

  setWebSocketEventListeners() {
    this.websocketService.onMessageType('player_status', this.setPlayerStatus);
  }

  setReadyHandlerFunction(readyHandlerFunction: (isReady: boolean) => void) {
    this.readyHandlerFunction = readyHandlerFunction;
  }
  setPlayerStatus = (message: WebSocketMsg) => {
    const { playerId, isReady } = message.data;
    if (playerId === GameRoomWebSocketService.sessionId) {
      this.readyHandlerFunction(isReady);
    }
    GameRoomWebSocketService.playersHandlerFunction((prevPlayers: Player[]) => {
      return prevPlayers.map((player: Player) => {
        if (player.sessionID === playerId) {
          return { ...player, isReady };
        }
        return player;
      });
    });
  };

  setMyStatus(isReady: boolean) {
    this.websocketService.sendMessage({
      type: WebSocketMessageType.SET_MY_STATE,
      data: {
        isReady,
      },
    });
  }
  close(): void {
    this.websocketService.offMessageType('player_status');
  }
}
