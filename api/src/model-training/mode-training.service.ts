import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AxiosService } from 'src/shared/modules/axios/axios.service';
import { GameModel } from 'src/shared/schemas/game.schema';
import * as FormData from 'form-data';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ModelTrainingService {
  constructor(
    @InjectModel(GameModel.name) private readonly gameModel: Model<GameModel>,
    private readonly axiosService: AxiosService
  ) {}

  async sendTrainingPhoto(file: Express.Multer.File, gameId: string, playerId: string) {
    const game = await this.gameModel.findOne({ gameId }).exec();
    if (!game.players.find((p) => p.sessionId === playerId)) {
      throw new HttpException('Player is not in the game', 400);
    }
    const formData = new FormData();
    const fileExtension = file.originalname.split('.').pop(); // Get file extension
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;
    formData.append('file', file.buffer, uniqueFilename);

    const response = await this.axiosService.modelTrainingApiClient.post(
      `/collect-data/${gameId}/${playerId}/upload-training-photo`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      }
    );
    console.log(response.data);
  }
}
