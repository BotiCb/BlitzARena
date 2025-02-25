import { AbstractCustomWebSocketService } from './custom-websocket.abstract-service';
import { WebSocketMessageType, WebSocketMsg } from './websocket-types';

import { Player } from '~/utils/models';
import { TEAM } from '~/utils/types';

export class GameRoomWebSocketService extends AbstractCustomWebSocketService {
  private readyHandlerFunction: (isReady: boolean) => void = () => {};

  setWebSocketEventListeners() {
    this.websocketService.onMessageType('player_status', this.setPlayerStatus);
    this.websocketService.onMessageType('game_room_phase_info', this.onPhaseInfo);
    this.websocketService.onMessageType('player_team_selected', this.onPlayerTeamSelected);
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

  onPhaseInfo = (message: WebSocketMsg) => {
    const playeReadyArray = message.data as { playerId: string; isReady: boolean }[];
    GameRoomWebSocketService.playersHandlerFunction((prevPlayers: Player[]) => {
      return prevPlayers.map((player: Player) => {
        for (const playerReady of playeReadyArray) {
          if (player.sessionID === playerReady.playerId) {
            return { ...player, isReady: playerReady.isReady };
          }
        }
        return player;
      });
    });
    GameRoomWebSocketService.isPhaseInfosNeededHandlerFunction(false);
  };
  close(): void {
    this.websocketService.offMessageType('player_status');
  }

  selectTeam = (team: TEAM) => {
    this.websocketService.sendMessage({
      type: WebSocketMessageType.SELECT_TEAM,
      data: {
        team,
      },
    });
  };

  onPlayerTeamSelected = (message: WebSocketMsg) => {
    const { playerId, team } = message.data;
    GameRoomWebSocketService.playersHandlerFunction((prevPlayers: Player[]) => {
      return prevPlayers.map((player: Player) => {
        if (player.sessionID === playerId) {
          return { ...player, team };
        }
        return player;
      });
    });
  };
}
