import { Body, Controller, HttpException, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { TrainingPhotoDto } from './dto/input/training-photo.dto';
import { ServiceApiRole, UserRole } from 'src/shared/decorators/roles.decorator';
import { CurrentGame } from 'src/shared/decorators/current-game.decorator';
import { ModelTrainingService } from './model-training.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { TrainingRequestDto } from './dto/input/training-request';
import { TrainingErrorDto } from './dto/input/training-error.dto';
import { TrainingResultsDto } from './dto/input/training-result.dto';
import { GameModel } from 'src/shared/schemas/collections/game.schema';
import { UserModel } from 'src/shared/schemas/collections/user.schema';

@Controller('model-training')
export class ModelTrainingController {
  constructor(private readonly modelTrainingService: ModelTrainingService) {}

  @UserRole()
  @Post('upload-photo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(
    @CurrentUser() user: UserModel,
    @CurrentGame() game: GameModel,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: TrainingPhotoDto
  ) {
    if (!file) {
      throw new HttpException('No file uploaded', 400);
    }
    console.log(dto);
    return this.modelTrainingService.sendTrainingPhoto(file, dto.gameId, dto.playerId, parseInt(dto.photoSize));
  }

  @ServiceApiRole('lobbyApi')
  @Post('start-training/:gameId')
  async startTraining(@Param('gameId') gameId: string, @Body() input: TrainingRequestDto) {
    console.log(input);
    return await this.modelTrainingService.sendStartTrainingSignal(gameId, input.numClasses, input.numImagesPerClass);
  }

  @ServiceApiRole('modelTrainerApi')
  @Post('training-ended/:gameId')
  async trainingEnded(@Param('gameId') gameId: string) {
    return await this.modelTrainingService.trainingReady(gameId);
  }

  @ServiceApiRole('modelTrainerApi')
  @Post('training-error/:gameId')
  async trainingEndedWithError(@Param('gameId') gameId: string, @Body() body: TrainingErrorDto) {
    console.log(body);
    return await this.modelTrainingService.trainingError(gameId, body.errorMessage);
  }

  @ServiceApiRole('modelTrainerApi')
  @Post(':gameId/training-progress/:progress')
  async trainingProgress(@Param('gameId') gameId: string, @Param('progress') progress: number) {
    console.log(progress);
    return await this.modelTrainingService.trainingProgress(gameId, progress);
  }

  @ServiceApiRole('modelTrainerApi')
  @Post(':gameId/statistics')
  async trainingStatistics(@Param('gameId') gameId: string, @Body() body: TrainingResultsDto) {
    return this.modelTrainingService.saveStatistics(gameId, body);
  }

  @ServiceApiRole('modelTrainerApi')
  @Post(':gameId/upload-tflite-model')
  @UseInterceptors(FileInterceptor('file'))
  async uploadTfLiteModel(@Param('gameId') gameId: string, @UploadedFile() file: Express.Multer.File) {
    return this.modelTrainingService.uploadTfLiteModel(gameId, file);
  }
}
