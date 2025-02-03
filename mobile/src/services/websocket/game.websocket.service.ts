import { AbstractCustomWebSocketService } from './custom-websocket.abstract-service';
import { PlayerWSInfo, WebSocketMessageType, WebSocketMsg } from './websocket-types';
import { USER_ENDPOINTS } from '../restApi/Endpoints';
import { apiClient } from '../restApi/RestApiService';
import { PlayerInfoResponseDto } from '../restApi/dto/response.dto';

import { mergePlayerArray, mergePlayer } from '~/utils/mappers';
import { Player } from '~/utils/models';
import { StackNavigationProp } from '@react-navigation/stack';
import { GameStackParamList } from '~/navigation/types';

// game.websocket.service.ts
export class GameWebSocketService extends AbstractCustomWebSocketService {
  private playersHandlerFunction: (players: any) => void = () => {};
  private areYouHostHandlerFunction: (areYouHost: boolean) => void = () => {};
  private navigator: StackNavigationProp<GameStackParamList> | null = null;
  private gameId: string = '';
  private sessionId: string = '';

  setWebSocketEventListeners() {
    this.websocketService.onMessageType('game_info', this.handleGameInfoEvent);
    this.websocketService.onMessageType('player_joined', this.handlePlayerJoinedEvent);
    this.websocketService.onMessageType('player_connected', this.handlePlayerConnectedEvent);
    this.websocketService.onMessageType('player_disconnected', this.handlePlayerDisconnectedEvent);
    this.websocketService.onMessageType('player_exited', this.handlePlayerLeftEvent);
    this.websocketService.onMessageType('player_removed', this.handlePlayerRemovedEvent);
    this.websocketService.onMessageType('new_host', this.handleNewHostEvent);
    this.websocketService.onMessageType('you_were_removed', this.handleYouWereRemovedEvent);
  }

  setPlayersHandlerFunction = (handler: (players: Player[]) => void) => {
    this.playersHandlerFunction = handler;
  };

  setAreYouHostHandlerFunction = (handler: (areYouHost: boolean) => void) => {
    this.areYouHostHandlerFunction = handler;
  };

  setGameId = (gameId: string) => {
    this.gameId = gameId;
  };

  setSessionId = (sessionId: string) => {
    this.sessionId = sessionId;
  };
  setNavigationHandler = (navigator: StackNavigationProp<GameStackParamList>) => {
    this.navigator = navigator;
  };

  handleGameInfoEvent = async (message: WebSocketMsg) => {
    if (!this.gameId) {
      throw new Error('Game id is not set');
    }

    try {
      const playerDetails: PlayerInfoResponseDto[] = (
        await apiClient.get(USER_ENDPOINTS.GET_PLAYERS_IN_GAME(this.gameId))
      ).data;

      const playersInGame: PlayerWSInfo[] = message.data.players;
      if (
        playersInGame.find((player: PlayerWSInfo) => player.playerId === this.sessionId)?.isHost
      ) {
        this.areYouHostHandlerFunction(true);
      }
      this.playersHandlerFunction(mergePlayerArray(playersInGame, playerDetails));
    } catch (e) {
      console.log(e);
    }
  };

  handlePlayerJoinedEvent = async (message: WebSocketMsg) => {
    try {
      const connectedPlayer: PlayerWSInfo = message.data;
      const playerDetails: PlayerInfoResponseDto = (
        await apiClient.get(USER_ENDPOINTS.GET_PLAYER_BY_SESSION_ID(connectedPlayer.playerId))
      ).data;

      const mergedPlayer = mergePlayer(connectedPlayer, playerDetails);
      console.log(mergedPlayer);
      // Correctly use previous state to avoid nested arrays
      this.playersHandlerFunction((prevPlayers: Player[]) => [...prevPlayers, mergedPlayer]);
    } catch (e) {
      console.log(e);
    }
  };

  handlePlayerConnectedEvent = async (message: WebSocketMsg) => {
    const connectedPlayerId: string = message.data;

    this.playersHandlerFunction((prevPlayers: Player[]) => {
      return prevPlayers.map((player: Player) => {
        if (player.sessionID === connectedPlayerId) {
          return { ...player, isConnected: true }; // Immutable update
        }
        return player;
      });
    });
  };

  handlePlayerDisconnectedEvent = async (message: WebSocketMsg) => {
    const disconnectedPlayerId: string = message.data;

    this.playersHandlerFunction((prevPlayers: Player[]) => {
      return prevPlayers.map((player: Player) => {
        if (player.sessionID === disconnectedPlayerId) {
          return { ...player, isConnected: false };
        }
        return player;
      });
    });
  };

  handlePlayerLeftEvent = async (message: WebSocketMsg) => {
    const leftPlayerId: string = message.data;

    this.playersHandlerFunction((prevPlayers: Player[]) => {
      return prevPlayers.filter((player: Player) => player.sessionID !== leftPlayerId);
    });
  };

  handleNewHostEvent = async (message: WebSocketMsg) => {
    const newHostId: string = message.data;
    if (newHostId === this.sessionId) {
      this.areYouHostHandlerFunction(true);
    } else {
      this.areYouHostHandlerFunction(false);
    }
    this.playersHandlerFunction((prevPlayers: Player[]) => {
      return prevPlayers.map((player: Player) => {
        if (player.sessionID === newHostId) {
          return { ...player, isHost: true };
        }
        return { ...player, isHost: false };
      });
    });
  };

  setPlayerAsHost = (playerId: string) => {
    this.websocketService.sendMessage({
      type: WebSocketMessageType.SET_PLAYER_AS_HOST,
      data: {
        playerId,
      },
    });
  };

  removePlayer = (playerId: string) => {
    this.websocketService.sendMessage({
      type: WebSocketMessageType.REMOVE_PLAYER,
      data: {
        playerId,
      },
    });
  };

  handlePlayerRemovedEvent = async (message: WebSocketMsg) => {
    const removedPlayerId: string = message.data;
    this.playersHandlerFunction((prevPlayers: Player[]) => {
      return prevPlayers.filter((player: Player) => player.sessionID !== removedPlayerId);
    });
  };

  handleYouWereRemovedEvent = async (message: WebSocketMsg) => {
    if (!this.navigator) {
      throw new Error('Navigator is not set');
    }
    this.navigator.popToTop();
  };
}
