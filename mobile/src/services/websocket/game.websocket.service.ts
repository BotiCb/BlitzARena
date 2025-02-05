import { StackNavigationProp } from '@react-navigation/stack';

import { AbstractCustomWebSocketService } from './custom-websocket.abstract-service';
import { GameWSInfo, PlayerWSInfo, WebSocketMessageType, WebSocketMsg } from './websocket-types';
import { USER_ENDPOINTS } from '../restApi/Endpoints';
import { apiClient } from '../restApi/RestApiService';
import { PlayerInfoResponseDto } from '../restApi/dto/response.dto';

import { GameStackParamList } from '~/navigation/types';
import { mergePlayerArray, mergePlayer } from '~/utils/mappers';
import { Player } from '~/utils/models';
import { navigateToPhase } from '~/utils/utils';

// game.websocket.service.ts
export class GameWebSocketService extends AbstractCustomWebSocketService {
  private areYouHostHandlerFunction: (areYouHost: boolean) => void = () => {};
  private gamePhaseHandlerFunction: (gamePhase: string) => void = () => {};

  private navigator: StackNavigationProp<GameStackParamList> | null = null;
  private pinghandlerFunction: (ping: number) => void = () => {};
  private pingInterval: NodeJS.Timeout | null = null;

  setWebSocketEventListeners() {
    this.websocketService.onMessageType('game_info', this.handleGameInfoEvent);
    this.websocketService.onMessageType('player_joined', this.handlePlayerJoinedEvent);
    this.websocketService.onMessageType('player_connected', this.handlePlayerConnectedEvent);
    this.websocketService.onMessageType('player_disconnected', this.handlePlayerDisconnectedEvent);
    this.websocketService.onMessageType('player_exited', this.handlePlayerLeftEvent);
    this.websocketService.onMessageType('player_removed', this.handlePlayerRemovedEvent);
    this.websocketService.onMessageType('new_host', this.handleNewHostEvent);
    this.websocketService.onMessageType('you_were_removed', this.handleYouWereRemovedEvent);
    this.websocketService.onMessageType('pong', this.handlePongEvent);
    this.websocketService.onMessageType('game_phase', this.handleGamePhaseChangedEvent);

    this.startPingInterval();
  }
  private startPingInterval() {
    if (!this.pingInterval) {
      this.pingInterval = setInterval(() => {
        const currentTime = Date.now();
        this.websocketService.sendMessage({
          type: WebSocketMessageType.PING,
          data: {
            timestamp: currentTime,
          },
        });
      }, 1000);
    }
  }
  private handlePongEvent = (message: WebSocketMsg) => {
    const sentTimestamp = message.data.timestamp;
    const currentTime = Date.now();
    const latency = currentTime - sentTimestamp;
    this.pinghandlerFunction(latency);
  };

  setAreYouHostHandlerFunction = (handler: (areYouHost: boolean) => void) => {
    this.areYouHostHandlerFunction = handler;
  };

  setNavigationHandler = (navigator: StackNavigationProp<GameStackParamList>) => {
    this.navigator = navigator;
  };

  setPingHandlerFunction = (handler: (ping: number) => void) => {
    this.pinghandlerFunction = handler;
  };
  setGamePhaseHandlerFunction = (handler: (gamePhase: string) => void) => {
    this.gamePhaseHandlerFunction = handler;
  };

  handleGameInfoEvent = async (message: WebSocketMsg) => {
    if (!AbstractCustomWebSocketService.gameId) {
      throw new Error('Game id is not set');
    }
    const gameInfo: GameWSInfo = message.data;
    try {
      const playerDetails: PlayerInfoResponseDto[] = (
        await apiClient.get(
          USER_ENDPOINTS.GET_PLAYERS_IN_GAME(AbstractCustomWebSocketService.gameId)
        )
      ).data;

      const playersInGame: PlayerWSInfo[] = gameInfo.players;
      if (
        playersInGame.find(
          (player: PlayerWSInfo) => player.playerId === AbstractCustomWebSocketService.sessionId
        )?.isHost
      ) {
        this.areYouHostHandlerFunction(true);
      }
      GameWebSocketService.playersHandlerFunction(mergePlayerArray(playersInGame, playerDetails));
      this.gamePhaseHandlerFunction(gameInfo.currentPhase);
      if (this.navigator) {
        navigateToPhase(gameInfo.currentPhase, this.navigator);
      }
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
      GameWebSocketService.playersHandlerFunction((prevPlayers: Player[]) => [
        ...prevPlayers,
        mergedPlayer,
      ]);
    } catch (e) {
      console.log(e);
    }
  };

  handlePlayerConnectedEvent = async (message: WebSocketMsg) => {
    const connectedPlayerId: string = message.data;

    GameWebSocketService.playersHandlerFunction((prevPlayers: Player[]) => {
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

    GameWebSocketService.playersHandlerFunction((prevPlayers: Player[]) => {
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

    GameWebSocketService.playersHandlerFunction((prevPlayers: Player[]) => {
      return prevPlayers.filter((player: Player) => player.sessionID !== leftPlayerId);
    });
  };

  handleNewHostEvent = async (message: WebSocketMsg) => {
    const newHostId: string = message.data;
    if (newHostId === AbstractCustomWebSocketService.sessionId) {
      this.areYouHostHandlerFunction(true);
    } else {
      this.areYouHostHandlerFunction(false);
    }
    GameWebSocketService.playersHandlerFunction((prevPlayers: Player[]) => {
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
    GameWebSocketService.playersHandlerFunction((prevPlayers: Player[]) => {
      return prevPlayers.filter((player: Player) => player.sessionID !== removedPlayerId);
    });
  };

  handleYouWereRemovedEvent = async (message: WebSocketMsg) => {
    if (!this.navigator) {
      throw new Error('Navigator is not set');
    }
    this.navigator.popToTop();
  };

  handleGamePhaseChangedEvent = async (message: WebSocketMsg) => {
    this.gamePhaseHandlerFunction(message.data);
    if (this.navigator) {
      navigateToPhase(message.data, this.navigator);
    }
  };

  startNextGamePhase = () => {
    this.websocketService.sendMessage({
      type: WebSocketMessageType.NEXT_GAME_PHASE,
    });
  };

  close = () => {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    this.websocketService.close();
    this.websocketService.offMessageType('game_info');
    this.websocketService.offMessageType('player_joined');
    this.websocketService.offMessageType('player_connected');
    this.websocketService.offMessageType('player_disconnected');
    this.websocketService.offMessageType('player_exited');
    this.websocketService.offMessageType('player_removed');
    this.websocketService.offMessageType('new_host');
    this.websocketService.offMessageType('you_were_removed');
  };
}
