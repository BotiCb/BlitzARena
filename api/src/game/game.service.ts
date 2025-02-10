import { Injectable, Logger, HttpException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AxiosService } from "src/shared/modules/axios/axios.service";
import { GameModel, PlayerSession } from "src/shared/schemas/game.schema";
import { UserModel } from "src/shared/schemas/user.schema";
import { CreateGameDto } from "./dto/input/create-game.dto";
import { GameInfoDto } from "./dto/input/game-info.dto";
import { CreateGameResponseDto, JoinGameResponseDto } from "./dto/output/game-info.dto";

@Injectable()
export class GameService {
  constructor(
    @InjectModel(GameModel.name) private readonly gameModel: Model<GameModel>,
    private readonly logger: Logger,
    private readonly axiosService: AxiosService
  ) {}

  async createGame(user: UserModel, createGameDto: CreateGameDto): Promise<CreateGameResponseDto> {
    try {
      const response = await this.axiosService.apiClient.post('/game/create-game', createGameDto);
      const gameInfo: GameInfoDto = response.data;
      
      const sessionId = this.generateSessionIdforUser();

      await this.axiosService.apiClient.post(`/game/${gameInfo.gameId}/add-player/${sessionId}`);

      const newGame = new this.gameModel({
        gameId: gameInfo.gameId,
        creatorUser: user,
        players: [{ userId: user._id, sessionId }],
      });

      await newGame.save();

      user.recentGameId = gameInfo.gameId;
      user.recentSessionId = sessionId;
      await user.save();

      return { gameId: gameInfo.gameId, sessionId };
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

      // Check if the user is already in the game
      const isAlreadyInGame = game.players.some(p => p.userId.toString() === user._id.toString());
      if (isAlreadyInGame) {
        throw new HttpException('Player is already in the game', 400);
      }

      user.recentGameId = gameId;
      user.recentSessionId = sessionId;
      await user.save();

      game.players.push({ userId: user._id, sessionId } as PlayerSession);
      await game.save();

      return { sessionId };
    } catch (error) {
      if (error.response?.status === 403) {
        throw new HttpException('The game is full', 403);
      }

      if (error.response?.status === 404) {
        throw new HttpException('Game not found', 404);
      }

      this.logger.error(error.message);
      throw new HttpException('The game could not be joined', 503);
    }
  }

  async exitFromGame(user: UserModel): Promise<void> {
    try {
      const game = await this.getGameById(user.recentGameId);
      if (!game) {
        throw new HttpException('Game not found', 404);
      }

      game.players = game.players.filter(p => p.userId.toString() !== user._id.toString());
      await game.save();

      user.recentGameId = null;
      user.recentSessionId = null;
      await user.save();
    } catch (error) {
      this.logger.error(error.message);
      throw new HttpException('Error exiting the game', 503);
    }
  }

  private generateSessionIdforUser(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private async getGameById(gameId: string): Promise<GameModel | null> {
    return this.gameModel.findOne({ gameId }).exec();
  }
}
