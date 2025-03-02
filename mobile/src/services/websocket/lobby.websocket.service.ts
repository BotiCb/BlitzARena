import { AbstractCustomWebSocketService } from './custom-websocket.abstract-service';
import { GameWebSocketService } from './game.websocket.service';
import { WebSocketMessageType, WebSocketMsg } from './websocket-types';

import { Player } from '~/utils/models';

export class LobbyWebSocketService extends AbstractCustomWebSocketService {

  setWebSocketEventListeners() {
    this.websocketService.onMessageType('lobby_phase_info', this.onLobbyPhaseInfo);
  }

 

  setMyStatus(isReady: boolean) {
    this.websocketService.sendMessage({
      type: WebSocketMessageType.SET_MY_STATE,
      data: {
        isReady,
      },
    });
  }

  onLobbyPhaseInfo = (message: WebSocketMsg) => {
    const playeReadyArray = message.data as { playerId: string; isReady: boolean }[];
    LobbyWebSocketService.playersHandlerFunction((prevPlayers: Player[]) => {
      return prevPlayers.map((player: Player) => {
        for (const playerReady of playeReadyArray) {
          if (player.sessionID === playerReady.playerId) {
            return { ...player, isReady: playerReady.isReady };
          }
        }
        return player;
      });
    });
    LobbyWebSocketService.isPhaseInfosNeededHandlerFunction(false);
  };

  close(): void {
    this.websocketService.offMessageType('player_status');
    GameWebSocketService.playersHandlerFunction((prevPlayers: Player[]) => {
      return prevPlayers.map((player: Player) => {
        return { ...player, isReady: false };
      });
    });
  }
}
