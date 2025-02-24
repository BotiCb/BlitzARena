import { StackNavigationProp } from '@react-navigation/stack';
import RNFS from 'react-native-fs';

import { AbstractCustomWebSocketService } from './custom-websocket.abstract-service';
import { GameWSInfo, PlayerWSInfo, WebSocketMessageType, WebSocketMsg } from './websocket-types';
import { GAME_ENDPOINTS, USER_ENDPOINTS } from '../restApi/Endpoints';
import { apiClient } from '../restApi/RestApiService';
import { TfliteModelDto } from '../restApi/dto/request.dto';
import { PlayerInfoResponseDto } from '../restApi/dto/response.dto';

import { GameStackParamList } from '~/navigation/types';
import { fromPlayerWSInfoToPlayerModel, extendPlayer } from '~/utils/mappers';
import { Player } from '~/utils/models';
import { GamePhase, Model } from '~/utils/types';

export class GameWebSocketService extends AbstractCustomWebSocketService {
  private areYouHostHandlerFunction: (areYouHost: boolean) => void = () => {};
  private gamePhaseHandlerFunction: (gamePhase: GamePhase) => void = () => {};
  private modelHandlerFunction: (model: Model) => void = () => {};
  private trainingProgressHandlerFunction: (trainingProgress: number) => void = () => {};

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
    this.websocketService.onMessageType('model_ready', this.handleModelreadyEvent);
    this.websocketService.onMessageType('training_progress', this.handleTrainingProgressEvent);

    this.startPingInterval();
  }
  private startPingInterval() {
    if (!this.pingInterval) {
      this.pingInterval = setInterval(() => {
        if (!this.websocketService.isConnected()) {
          return;
        }
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
  setGamePhaseHandlerFunction = (handler: (gamePhase: GamePhase) => void) => {
    this.gamePhaseHandlerFunction = handler;
  };

  setModelHandlerFunction = (handler: (model: Model) => void) => {
    this.modelHandlerFunction = handler;
  };

  setTrainingProgressHandlerFunction = (handler: (trainingProgress: number) => void) => {
    this.trainingProgressHandlerFunction = handler;
  };

  handleGameInfoEvent = async (message: WebSocketMsg) => {
    if (!AbstractCustomWebSocketService.gameId) {
      throw new Error('Game id is not set');
    }
    const gameInfo: GameWSInfo = message.data;
    try {
      const playersInGame: PlayerWSInfo[] = gameInfo.players;
      GameWebSocketService.playersHandlerFunction(() =>
        playersInGame.map((player: PlayerWSInfo) => fromPlayerWSInfoToPlayerModel(player))
      );
      if (
        playersInGame.find(
          (player: PlayerWSInfo) => player.playerId === AbstractCustomWebSocketService.sessionId
        )?.isHost
      ) {
        this.areYouHostHandlerFunction(true);
      }

      this.fetchPlayersData();

      this.gamePhaseHandlerFunction(gameInfo.currentPhase);
      this.trainingProgressHandlerFunction(gameInfo.trainingProgress);

      if (gameInfo.isModelTrained) {
        this.setupModel();
      }
    } catch (e) {
      console.log(e);
    }
  };

  handlePlayerJoinedEvent = async (message: WebSocketMsg) => {
    try {
      const connectedPlayer: PlayerWSInfo = message.data;

      GameWebSocketService.playersHandlerFunction((prevPlayers: Player[]) => [
        ...prevPlayers,
        fromPlayerWSInfoToPlayerModel(connectedPlayer),
      ]);

      this.fetchPlayerData(connectedPlayer.playerId);
    } catch (e) {
      console.log(e);
    }
  };

  handlePlayerConnectedEvent = async (message: WebSocketMsg) => {
    const connectedPlayerId: string = message.data.trim();

    GameWebSocketService.playersHandlerFunction((prevPlayers: Player[]) => {
      return prevPlayers.map((player: Player) => {
        if (player.sessionID === connectedPlayerId) {
          return { ...player, isConnected: true };
        }
        return player;
      });
    });
  };

  handlePlayerDisconnectedEvent = async (message: WebSocketMsg) => {
    const disconnectedPlayerId: string = message.data as string;

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
    AbstractCustomWebSocketService.isPhaseInfosNeededHandlerFunction(true);
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

  handleModelreadyEvent = async (message: WebSocketMsg) => {
    this.setupModel();
  };

  handleTrainingProgressEvent = async (message: WebSocketMsg) => {
    const { progress } = message.data;
    this.trainingProgressHandlerFunction(progress);
  };

  fetchPlayersData = async () => {
    const playerDetails: PlayerInfoResponseDto[] = (
      await apiClient.get(USER_ENDPOINTS.GET_PLAYERS_IN_GAME(AbstractCustomWebSocketService.gameId))
    ).data;
    GameWebSocketService.playersHandlerFunction((prevPlayers: Player[]) => {
      return prevPlayers.map((player: Player) => {
        const playerDetail = playerDetails.find(
          (playerDetail: PlayerInfoResponseDto) => playerDetail.sessionId === player.sessionID
        );
        if (!playerDetail) {
          return player;
        }
        return extendPlayer(player, playerDetail);
      });
    });
  };

  fetchPlayerData = async (playerId: string) => {
    const playerDetails: PlayerInfoResponseDto = (
      await apiClient.get(USER_ENDPOINTS.GET_PLAYER_BY_SESSION_ID(playerId))
    ).data;
    GameWebSocketService.playersHandlerFunction((prevPlayers: Player[]) => {
      return prevPlayers.map((player: Player) => {
        if (player.sessionID === playerId) {
          return extendPlayer(player, playerDetails);
        }
        return player;
      });
    });
    console.log('Fetched player data:', playerDetails);
  };

  private setupModel = async () => {
    try {
      const response = await apiClient.get(
        GAME_ENDPOINTS.GET_TF_LITE_MODEL(GameWebSocketService.gameId)
      );
      const model: TfliteModelDto = response.data;

      const mappedLabels = model.labels.reduce(
        (acc, label, index) => {
          acc[index] = label;
          return acc;
        },
        {} as Record<number, string>
      );

      const modelPath = `${RNFS.DocumentDirectoryPath}/model.tflite`;

      await RNFS.writeFile(modelPath, model.modelBase64, 'base64');

      console.log('Model downloaded and saved at:', modelPath);
      this.modelHandlerFunction({
        path: modelPath,
        mapperArray: mappedLabels,
      });
    } catch (e) {
      console.error(`Error downloading model: ${e}`);
    }
  };
}
