import { AbstractCustomWebSocketService } from './custom-websocket.abstract-service';
import { PlayerWSInfo } from './websocket-types';
import { USER_ENDPOINTS } from '../restApi/Endpoints';
import { apiClient } from '../restApi/RestApiService';
import { PlayerInfoResponseDto } from '../restApi/dto/response.dto';

import { mergePlayerArray, mergePlayer } from '~/utils/mappers';
import { Player } from '~/utils/models';

// game.websocket.service.ts
export class GameWebSocketService extends AbstractCustomWebSocketService {
  private playersHandlerFunction: (players: any) => void = () => {}; // Initialize
  private gameId: string = '';

  setWebSocketEventListeners() {
    this.websocketService.onMessageType('game_info', this.handleGameInfoEvent);
    this.websocketService.onMessageType('player_joined', this.handlePlayerJoinedEvent);
    this.websocketService.onMessageType('player_connected', this.handlePlayerJoinedEvent);
  }

  setPlayersHandlerFunction = (handler: (players: Player[]) => void) => {
    this.playersHandlerFunction = handler;
  };

  setGameId = (gameId: string) => {
    this.gameId = gameId;
  };

  handleGameInfoEvent = async (message: any) => {
    if (!this.gameId) {
      throw new Error('Game id is not set');
    }

    try {
      const playerDetails: PlayerInfoResponseDto[] = (
        await apiClient.get(USER_ENDPOINTS.GET_PLAYERS_IN_GAME(this.gameId))
      ).data;

      const playersInGame: PlayerWSInfo[] = message.data.players;
      this.playersHandlerFunction(mergePlayerArray(playersInGame, playerDetails));
    } catch (e) {
      console.log(e);
    }
  };

  handlePlayerJoinedEvent = async (message: any) => {
    try {
      const connectedPlayer: PlayerWSInfo = message.data;
      const playerDetails: PlayerInfoResponseDto = (
        await apiClient.get(USER_ENDPOINTS.GET_PLAYER_BY_SESSION_ID(connectedPlayer.playerId))
      ).data;

      const mergedPlayer = mergePlayer(connectedPlayer, playerDetails);
      this.playersHandlerFunction((...players: Player[]) => [...players, mergedPlayer]);
    } catch (e) {
      console.log(e);
    }
  };
}
