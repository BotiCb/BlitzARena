import { AbstractCustomWebSocketService } from './custom-websocket.abstract-service';
import { WebSocketMessageType, WebSocketMsg } from './websocket-types';

import { Player } from '~/utils/models';
import { GameArea, TEAM } from '~/utils/types/types';

export class GameRoomWebSocketService extends AbstractCustomWebSocketService {
  private readyHandlerFunction: (isReady: boolean) => void = () => {};
  private gameAreaHandlerFunction: (gameArea: GameArea) => void = () => {};

  setWebSocketEventListeners() {
    this.websocketService.onMessageType('game_room_phase_info', this.onPhaseInfo);
    this.websocketService.onMessageType('player_team_selected', this.onPlayerTeamSelected);
    this.websocketService.onMessageType('game_area', this.onGameAreaUpdate);
  }

  setGameAreaHandlerFunction(gameAreaHandlerFunction: (gameArea: GameArea) => void) {
    this.gameAreaHandlerFunction = gameAreaHandlerFunction;
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
    this.websocketService.offMessageType('game_room_phase_info');
    this.websocketService.offMessageType('player_team_selected');
    this.websocketService.offMessageType('game_area');
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

  onGameAreaUpdate = (message: WebSocketMsg) => {
    const gameArea = message.data as GameArea;
    this.gameAreaHandlerFunction(gameArea);
  };

  sendGameArea = (gameArea: GameArea) => {
    this.websocketService.sendMessage({
      type: WebSocketMessageType.GAME_AREA_CHANGE,
      data: gameArea,
    });
  };
}
