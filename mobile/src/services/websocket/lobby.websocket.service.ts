import { AbstractCustomWebSocketService } from './custom-websocket.abstract-service';
import { WebSocketMessageType, WebSocketMsg } from './websocket-types';

import { Player } from '~/utils/models';

export class LobbyWebSocketService extends AbstractCustomWebSocketService {
  private readyHandlerFunction: (isReady: boolean) => void = () => {};

  setWebSocketEventListeners() {
    this.websocketService.onMessageType('player_status', this.setPlayerStatus);
  }

  setReadyHandlerFunction(readyHandlerFunction: (isReady: boolean) => void) {
    this.readyHandlerFunction = readyHandlerFunction;
  }
  setPlayerStatus = (message: WebSocketMsg) => {
    const { playerId, isReady } = message.data;
    if (playerId === LobbyWebSocketService.sessionId) {
      this.readyHandlerFunction(isReady);
    }
    LobbyWebSocketService.playersHandlerFunction((prevPlayers: Player[]) => {
      return prevPlayers.map((player: Player) => {
        if (player.sessionID === playerId) {
          return { ...player, isReady };
        }
        return player;
      });
    });
  };

  async setMyStatus(isReady: boolean) {
    await this.websocketService.sendMessage({
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
