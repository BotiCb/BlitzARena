import { Body, Controller, HttpException, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { TrainingPhotoDto } from './dto/input/training-photo.dto';
import { ServiceApiRole, UserInGameRole, UserRole } from 'src/shared/decorators/roles.decorator';
import { CurrentGame } from 'src/shared/decorators/current-game.decorator';
import { ModelTrainingService } from './model-training.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { TrainingRequestDto } from './dto/input/training-request';
import { TrainingErrorDto } from './dto/input/training-error.dto';
import { TrainingResultsDto } from './dto/input/training-result.dto';
import { GameModel } from 'src/shared/schemas/collections/game.schema';

@Controller('game/:gameId/model-training')
export class ModelTrainingController {
  constructor(private readonly modelTrainingService: ModelTrainingService) {}

  @UserInGameRole()
  @Post('upload-photo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: TrainingPhotoDto,
    @CurrentGame() game: GameModel
  ) {
    if (!file) {
      throw new HttpException('No file uploaded', 400);
    }
    return await this.modelTrainingService.sendTrainingPhoto(file, game, dto.playerId, parseInt(dto.photoSize));
  }

  @ServiceApiRole('gameSessionMicroService')
  @Post('start-training')
  async startTraining(@Param('gameId') gameId: string, @Body() input: TrainingRequestDto) {
    return await this.modelTrainingService.sendStartTrainingSignal(gameId, input.numClasses, input.numImagesPerClass);
  }

  @ServiceApiRole('modelTrainerMicroService')
  @Post('training-ended')
  async trainingEnded(@Param('gameId') gameId: string) {
    return await this.modelTrainingService.trainingReady(gameId);
  }

  @ServiceApiRole('modelTrainerMicroService')
  @Post('training-error')
  async trainingEndedWithError(@Param('gameId') gameId: string, @Body() body: TrainingErrorDto) {
    console.log(body);
    return await this.modelTrainingService.trainingError(gameId, body.errorMessage);
  }

  @ServiceApiRole('modelTrainerMicroService')
  @Post('training-progress/:progress')
  async trainingProgress(@Param('gameId') gameId: string, @Param('progress') progress: number) {
    return await this.modelTrainingService.trainingProgress(gameId, progress);
  }

  @ServiceApiRole('modelTrainerMicroService')
  @Post('statistics')
  async trainingStatistics(@Param('gameId') gameId: string, @Body() body: TrainingResultsDto) {
    return this.modelTrainingService.saveStatistics(gameId, body);
  }

  @ServiceApiRole('modelTrainerMicroService')
  @Post('/upload-tflite-model')
  @UseInterceptors(FileInterceptor('file'))
  async uploadTfLiteModel(@Param('gameId') gameId: string, @UploadedFile() file: Express.Multer.File) {
    return this.modelTrainingService.uploadTfLiteModel(gameId, file);
  }
}

