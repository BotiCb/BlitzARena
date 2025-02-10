import { HttpException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { GameModel } from "src/shared/schemas/game.schema";

@Injectable()
export class ModelTrainingService {
    constructor(@InjectModel(GameModel.name) private readonly gameModel: Model<GameModel>) {}

    async sendTrainingPhoto(file: Express.Multer.File, gameId: string, playerId: string) {

        const game = await this.gameModel.findOne({gameId}).exec();
        if(!game.players.find(p => p.sessionId === playerId)) {
            throw new HttpException('Player is not in the game', 400);
        }
        //console.log(file);

    }

}