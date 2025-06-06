import { Injectable, Logger, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AxiosService } from 'src/shared/modules/axios/axios.service';

import { CreateGameDto } from './dto/input/create-game.dto';
import { GameInfoDto } from './dto/input/game-info.dto';
import { CreateGameResponseDto, JoinGameResponseDto } from './dto/output/game-info.dto';
import { GameModel } from 'src/shared/schemas/collections/game.schema';
import { UserModel } from 'src/shared/schemas/collections/user.schema';
import { PlayerSessionModel } from 'src/shared/schemas/helpers/player-session.schema';
import { FileUploadService } from 'src/shared/modules/file-upload/file-upload.service';
import { Readable } from 'stream';
import { PlayerConnectionState } from 'src/shared/utils/types';
import { TfliteModelDto } from './dto/output/tflite-model.dto';

@Injectable()
export class GameService {
  private logger = new Logger(GameService.name);
  constructor(
    @InjectModel(GameModel.name) private readonly gameModel: Model<GameModel>,
    private readonly axiosService: AxiosService,
    private readonly fileUploadService: FileUploadService
  ) {}

  async createGame(user: UserModel, createGameDto: CreateGameDto): Promise<CreateGameResponseDto> {
    try {
      const response = await this.axiosService.apiClient.post('/game/create-game', createGameDto, { timeout: 5000 });
      await this.axiosService.modelTrainingApiClient.get('', { timeout: 5000 });
      const gameInfo: GameInfoDto = response.data;

      const sessionId = user.firstName + user.lastName;

      await this.axiosService.apiClient.post(`/game/${gameInfo.gameId}/add-player/${sessionId}`);

      const newGame = new this.gameModel({
        gameId: gameInfo.gameId,
        creatorUser: user,
        players: [{ userId: user._id, sessionId, connectionState: PlayerConnectionState.PENDING }],
      });

      await newGame.save();

      user.recentGameId = gameInfo.gameId;
      user.recentSessionId = sessionId;
      await user.save();

      this.logger.log(`Game created with ID: ${gameInfo.gameId} by user: ${user._id}`);

      return { gameId: gameInfo.gameId, sessionId };
    } catch (error) {
      this.logger.error('Error creating game', error.message);
      throw new HttpException('The game could not be created', 503);
    }
  }

  async joinGame(gameId: string, user: UserModel): Promise<JoinGameResponseDto> {
    const game = await this.getGameById(gameId);

    if (game.endedAt) {
      throw new HttpException('Game already ended', 400);
    }
    const playerSession = game.players.find((p) => p.userId.toString() === user._id.toString());
    if (playerSession && playerSession.connectionState === PlayerConnectionState.DISCONNECTED) {
      playerSession.connectionState = PlayerConnectionState.PENDING;
      return { sessionId: playerSession.sessionId };
    }

    try {
      const sessionId = user.firstName + user.lastName;
      await this.axiosService.apiClient.post(`/game/${gameId}/add-player/${sessionId}`);

      user.recentGameId = gameId;
      user.recentSessionId = sessionId;
      await user.save();

      game.players.push({
        userId: user._id,
        sessionId,
        connectionState: PlayerConnectionState.PENDING,
      } as PlayerSessionModel);
      await game.save();

      this.logger.log(`User ${user._id} joined game ${gameId}`);

      return { sessionId };
    } catch (error) {
      if (error.response?.status === 403) {
        throw new HttpException('The game is full', 403);
      }

      if (error.response?.status === 404) {
        throw new HttpException('Game not found', 404);
      }

      throw new HttpException('The game could not be joined', 503);
    }
  }

  async exitFromGame(user: UserModel): Promise<void> {
    try {
      const game = await this.getGameById(user.recentGameId);
      game.players = game.players.filter((p) => p.userId.toString() !== user._id.toString());
      await game.save();

      user.recentGameId = null;
      user.recentSessionId = null;
      await user.save();

      this.logger.log(`User ${user._id} exited from game ${game.gameId}`);
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException('Error exiting the game', 503);
    }
  }

  private generateSessionIdforUser(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private async getGameById(gameId: string): Promise<GameModel> {
    const game = await this.gameModel.findOne({ gameId }).exec();
    if (!game) {
      throw new HttpException('Game not found', 404);
    }
    return game;
  }

  async getTfLiteModel(game: GameModel): Promise<TfliteModelDto> {
    if( !game.trainingSession ) {
      throw new HttpException('Model not ready', 404);
    }
    if (game.trainingSession.tfLiteModelUrl === null || game.trainingSession.tfLiteModelUrl === undefined) {
      throw new HttpException('Model not ready', 404);
    }

    if(game.endedAt) {
      throw new HttpException('Game already ended', 400);
    }


    const buffer = await this.fileUploadService.downloadTfLiteModel(game.trainingSession.tfLiteModelUrl);
    const modelBase64 = buffer.toString('base64');
    const label = game.trainingSession.trainingResults.metadata.classNames;
    return { modelBase64, labels: label } as TfliteModelDto;
  }

  async closeGame(gameId: string) {
    const game = await this.gameModel.findOne({ gameId }).populate('trainingSession').exec();
    if (!game) {
      throw new HttpException('Game not found', 404);
    }

    if (game.endedAt) {
      throw new HttpException('Game already ended', 400);
    }
    game.endedAt = new Date();
    
    // if (game.trainingSession && game.trainingSession.tfLiteModelUrl) {
    //   this.fileUploadService.deleteFile(game.trainingSession.tfLiteModelUrl);
    //   game.trainingSession.tfLiteModelUrl = null;
    //   await game.trainingSession.save();
    // }
    await game.save();

    this.logger.log(`Game ${gameId} closed`);
  }

  async updatePlayerConnectionStatus(gameId: string, userSessionId: string, connection: PlayerConnectionState) {
    const game = await this.getGameById(gameId);
    const playerSession = game.players.find((p) => p.sessionId === userSessionId);

    if (!playerSession) {
      throw new HttpException('Player not found', 404);
    }
    playerSession.connectionState = connection;
    await game.save();
  }
}
