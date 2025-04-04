import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AxiosService } from 'src/shared/modules/axios/axios.service';
import * as FormData from 'form-data';
import { v4 as uuidv4 } from 'uuid';
import * as sharp from 'sharp';
import { GameModel } from 'src/shared/schemas/collections/game.schema';
import { TrainingSessionModel } from 'src/shared/schemas/collections/training-session.schema';
import { TrainingResultsDto } from './dto/input/training-result.dto';
import { FileUploadService } from 'src/shared/modules/file-upload/file-upload.service';
import { PersonDetectionService } from 'src/shared/modules/person-detection/person-detecton.service';

@Injectable()
export class ModelTrainingService {
  private logger = new Logger(ModelTrainingService.name);
  constructor(
    @InjectModel(GameModel.name) private readonly gameModel: Model<GameModel>,
    @InjectModel(TrainingSessionModel.name) private readonly trainingSessionModel: Model<TrainingSessionModel>,
    private readonly axiosService: AxiosService,
    private readonly fileUploadService: FileUploadService,
    private readonly personDetectionService: PersonDetectionService
  ) {}

  async sendTrainingPhoto(file: Express.Multer.File, game: GameModel, playerId: string, photoSize: number) {
    
    if (!game.players.find((p) => p.sessionId === playerId)) {
      throw new HttpException('Player is not in the game', 400);
    }
    if (game.trainingSession && game.trainingSession.inProgress) {
      throw new HttpException('Training is already in progress', 422);
    }
    if (!game.trainingSession) {
      const trainingSession = await this.trainingSessionModel.create({ inProgress: false, photoSize });
      game.trainingSession = trainingSession;
      await game.save();
    }



    if (game.trainingSession.photoSize !== photoSize) {
      console.error('Photo size does not match ' + game.trainingSession.photoSize + ' ' + photoSize);
      throw new HttpException('Photo size does not match', 400);
    }

    const fileExtension = file.originalname.split('.').pop();
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;
    const image = sharp(file.buffer);

    const metadata = await image.metadata();
    const shouldRotate = metadata.width > metadata.height;

    let resizedImageBuffer;
    if (shouldRotate) {
      resizedImageBuffer = await image.resize(photoSize, photoSize, { fit: 'fill' }).rotate(90).toBuffer();
    } else {
      resizedImageBuffer = await image.resize(photoSize, photoSize, { fit: 'fill' }).toBuffer();
    }

    if(!await this.personDetectionService.detectPerson(await image.toBuffer())) {
      throw new HttpException('No person detected in the image', 499);
    }    

    const formData = new FormData();
    formData.append('file', resizedImageBuffer, {
      filename: uniqueFilename,
      contentType: file.mimetype,
    });
    await this.axiosService.modelTrainingApiClient.post(
      `/collect-data/${game.gameId}/${playerId}/upload-training-photo`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      }
    );
 
}

  async sendStartTrainingSignal(gameId: string, numClasses: number, numImagesPerClass: number) {
    try {
      const game = await this.gameModel.findOne({ gameId }).populate('trainingSession').exec();
      if (!game) {
        throw new HttpException('Game not found', 404);
      }
      if (!game.trainingSession) {
        throw new HttpException('Training session not initialized. Send training photos first.', 400);
      }
      if (game.trainingSession.startedAt) {
        throw new HttpException('Training is already in progress', 400);
      }
      // Update training session properties
      game.trainingSession.inProgress = true;
      game.trainingSession.numClasses = numClasses;
      game.trainingSession.numImagesPerClass = numImagesPerClass;
      game.trainingSession.startedAt = new Date();

      // Save the updated training session document
      await game.trainingSession.save();

      this.axiosService.modelTrainingApiClient.post(
        `/training/${gameId}/start-training/${game.trainingSession.photoSize}`
      );
      this.logger.log(`Training started for game ${gameId}`);
    } catch (error) {
      this.trainingError(gameId, error.message);
    }
  }

  async trainingReady(gameId: string) {
    const game = await this.gameModel.findOne({ gameId }).populate('trainingSession').exec();
    if (!game) {
      throw new HttpException('Game not found', 404);
    }
    game.trainingSession.inProgress = false;
    game.trainingSession.endedAt = new Date();
    await game.trainingSession.save();
    await this.axiosService.apiClient.post(`game/${gameId}/training-finished`);
    this.logger.log(`Training finished for game ${gameId}`);
  }

  async trainingError(gameId: string, errorMessage: string) {
    const game = await this.gameModel.findOne({ gameId }).populate('trainingSession').exec();
    if (!game) {
      throw new HttpException('Game not found', 404);
    }
    if (!game.trainingSession) {
      throw new HttpException('Training session not initialized. Send training photos first.', 400);
    }
    game.trainingSession.inProgress = false;
    game.trainingSession.endedAt = new Date();
    if (game.endedAt && !errorMessage.includes('Game already ended')) {
      errorMessage = errorMessage + ' Game already ended';
    }

    game.trainingSession.errorMessage = errorMessage;
    await game.trainingSession.save();
    game.unsuccessfulTrainingSessions.push(game.trainingSession);
    game.trainingSession = null;
    await game.save();
    if (!game.endedAt) {
      await this.axiosService.apiClient.post(`game/${gameId}/training-error`);
    }
    this.logger.error(`Training error for game ${gameId}: ${errorMessage}`);
  }

  async trainingProgress(gameId: string, progress: number) {
    const game = await this.gameModel.findOne({ gameId }).populate('trainingSession').exec();
    if (!game) {
      throw new HttpException('Game not found', 404);
    }

    if (!game.trainingSession) {
      throw new HttpException('Training session not initialized. Send training photos first.', 400);
    }
    if (game.endedAt) {
      throw new HttpException('Game already ended', 400);
    }
    await this.axiosService.apiClient.post(`game/${gameId}/training-progress/${progress}`);
  }

  async saveStatistics(gameId: string, trainingResults: TrainingResultsDto) {
    const game = await this.gameModel.findOne({ gameId }).populate('trainingSession').exec();
    if (!game) {
      throw new HttpException('Game not found', 404);
    }
    game.trainingSession.trainingResults = trainingResults;
    await game.trainingSession.save();
  }

  async uploadTfLiteModel(gameId: string, file: Express.Multer.File) {
    const game = await this.gameModel.findOne({ gameId }).populate('trainingSession').exec();
    if (!game) {
      throw new HttpException('Game not found', 404);
    }
    if (!file) {
      throw new HttpException('No file uploaded', 400);
    }
    if (game.endedAt) {
      throw new HttpException('Game already ended', 400);
    }
    game.trainingSession.tfLiteModelUrl = await this.fileUploadService.uploadTfLiteModel(file);
    await game.trainingSession.save();

    this.logger.log(`TF Lite model uploaded for game ${gameId}`);
  }
}
