import { CanActivate, ExecutionContext, Injectable, ForbiddenException, HttpException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GameModel } from '../schemas/game.schema';


@Injectable()
export class PlayerInGameGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectModel(GameModel.name) public readonly gameModel: Model<GameModel>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

   const { gameId } = request.body;

    const game = await this.gameModel.findOne({ gameId }).exec();

    if (!game) {
      throw new HttpException('Game not found', 404);
    }

    if (!game.players.includes(user._id)) {
      throw new ForbiddenException('You are not a player in this game');
    }

    request['game'] = game;

    return true;
  }
}