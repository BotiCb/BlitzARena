import { Body, Controller, Get, HttpException, Param, Post } from '@nestjs/common';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { PlayerInGameRole, UserRole } from 'src/shared/decorators/roles.decorator';
import { UserModel } from 'src/shared/schemas/collections/user.schema';
import { CreateGameDto } from './dto/input/create-game.dto';
import { create } from 'domain';
import { GameService } from './game.service';
import { CreateGameResponseDto, JoinGameResponseDto } from './dto/output/game-info.dto';
import { CurrentGame } from 'src/shared/decorators/current-game.decorator';
import { GameModel } from 'src/shared/schemas/collections/game.schema';

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
  async getTfLiteModel(@CurrentGame() game: GameModel) : Promise<string> {
    return this.gameService.getTfLiteModel(game);
  }
}
