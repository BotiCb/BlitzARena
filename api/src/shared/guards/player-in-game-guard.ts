import { CanActivate, ExecutionContext, Injectable, ForbiddenException, HttpException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GameModel } from '../schemas/collections/game.schema';
import { extractGameIdFromUrl } from '../utils/mapper';

@Injectable()
export class PlayerInGameGuard implements CanActivate {
  constructor(
    @InjectModel(GameModel.name) public readonly gameModel: Model<GameModel>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const gameId  = extractGameIdFromUrl(request.url);
    console.log(gameId);
    if (!gameId) {
      throw new HttpException('Game not found in the url', 405);
    }
    const game = await this.gameModel.findOne({ gameId }).populate('players').populate('trainingSession').exec();

    if (!game) {
      throw new HttpException('Game not found', 404);
    }

    // if (!game.players.map((player) => player.userId.toString()).includes(user._id.toString())) {
    //   throw new ForbiddenException('You are not a player in this game');
    // }

    request['game'] = game;
    return true;
  }
}
