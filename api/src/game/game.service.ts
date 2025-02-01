import { HttpException, Inject, Injectable, Logger } from '@nestjs/common';
import { UserModel } from 'src/shared/schemas/user.schema';
import { CreateGameDto } from './dto/input/create-game.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GameModel } from 'src/shared/schemas/game.schema';
import { JwtService } from '@nestjs/jwt';
import { config } from 'src/shared/config/config';
import axios, { Axios, AxiosResponse } from 'axios';
import { FASTAPI_BASE_URL } from 'src/shared/utils/constants';
import { GameInfoDto } from './dto/input/game-info.dto';
import { UserInfoToGameDto } from 'src/users/dto/output/user-info.dto';
import { AxiosService } from 'src/shared/modules/axios/axios.service';
import { CreateGameResponseDto, JoinGameResponseDto } from './dto/output/game-info.dto';

@Injectable()
export class GameService {
  constructor(
    @InjectModel(GameModel.name) private readonly gameModel: Model<GameModel>,
    private readonly jwtService: JwtService,
    private readonly logger: Logger,
    private readonly axiosService: AxiosService
  ) {}

  async createGame(user: UserModel, createGameDto: CreateGameDto): Promise<CreateGameResponseDto> {
    try {
      const response = await this.axiosService.apiClient.post('/game/create-game', createGameDto);

      const gameInfo: GameInfoDto = response.data;

      const createdGame = await new this.gameModel({
        gameId: gameInfo.gameId,
        maxPlayers: gameInfo.maxPlayers,
        players: [user],
        creatorUser: user,
      }).save();

      const sessionId = this.generateSessionIdforUser();

      await this.axiosService.apiClient.post(`/game/${gameInfo.gameId}/add-player/${sessionId}`);

      user.recentGameId = gameInfo.gameId;
      user.recentSessionId = sessionId;
      await user.save();

      return {
        gameId: gameInfo.gameId,
        sessionId,
      };
    } catch (error) {
      this.logger.error(error);

      throw new HttpException('The game could not be created', 503);
    }
  }

  async joinGame(gameId: string, user: UserModel): Promise<JoinGameResponseDto> {
    if (user.recentGameId === gameId) {
      throw new HttpException('You are already in this game', 400);
    }

    try {
      const sessionId = this.generateSessionIdforUser();
      await this.axiosService.apiClient.post(`/game/${gameId}/add-player/${sessionId}`);

      const game = await this.getGameById(gameId);

      if (!game) {
        throw new HttpException('Game not found', 404);
      }

      user.recentGameId = gameId;
      user.recentSessionId = sessionId;
      await user.save();

      game.players.push(user);
      await game.save();

      return {
        sessionId,
      };
    } catch (error) {
      if (error.response && error.response.status === 403) {
        throw new HttpException('The game is full', 403);
      }
      this.logger.error(error.message);
      throw new HttpException('The game could not be joined', 503);
    }
  }

  async exitFromGame(user: UserModel): Promise<void> {}

  private generateSessionIdforUser(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private async getGameById(gameId: string): Promise<GameModel | null> {
    return this.gameModel.findOne({ gameId }).exec();
  }
}
