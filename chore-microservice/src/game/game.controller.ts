import { Body, Controller, Get, HttpException, Param, Post } from '@nestjs/common';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { PlayerInGameRole, ServiceApiRole, UserRole } from 'src/shared/decorators/roles.decorator';
import { UserModel } from 'src/shared/schemas/collections/user.schema';
import { CreateGameDto } from './dto/input/create-game.dto';
import { GameService } from './game.service';
import { CreateGameResponseDto, JoinGameResponseDto } from './dto/output/game-info.dto';
import { CurrentGame } from 'src/shared/decorators/current-game.decorator';
import { GameModel } from 'src/shared/schemas/collections/game.schema';
import { PlayerConnectionState } from 'src/shared/utils/types';
import { TfliteModelDto } from './dto/output/tflite-model.dto';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('create')
  @UserRole()
  createGame(@CurrentUser() user: UserModel, @Body() createGameDto: CreateGameDto): Promise<CreateGameResponseDto> {
    if (createGameDto.maxPlayers < 2) throw new HttpException('The game must have at least 2 players', 400);
    return this.gameService.createGame(user, createGameDto);
  }

  @Post('/:gameId/join')
  @UserRole()
  joinGame(@CurrentUser() user: UserModel, @Param('gameId') gameId: string): Promise<JoinGameResponseDto> {
    return this.gameService.joinGame(gameId, user);
  }

  @Get('/:gameId/tflite-model')
  @PlayerInGameRole()
  async getTfLiteModel(@CurrentGame() game: GameModel) : Promise<TfliteModelDto> {
   const model = await this.gameService.getTfLiteModel(game);
    return model;
  }

  @Post('/:gameId/close')
  @ServiceApiRole('gameSessionMicroService')
  closeGame(@Param('gameId') gameId: string) {
    return this.gameService.closeGame(gameId);
  }


  @Post('/:gameId/player/:playerId/connection-status/:connectionStatus')
  @ServiceApiRole('gameSessionMicroService')
  updatePlayerConnectionStatus(@Param('gameId') gameId: string, @Param('playerId') playerId: string, @Param('connectionStatus') connectionStatus: PlayerConnectionState) {
    return this.gameService.updatePlayerConnectionStatus(gameId, playerId, connectionStatus);
  }



}
