import { Body, Controller, HttpException, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { UserModel } from 'src/shared/schemas/user.schema';
import { TrainingPhotoDto } from './dto/input/training-photo.dto';
import { ServiceApiRole, UserRole } from 'src/shared/decorators/roles.decorator';
import { CurrentGame } from 'src/shared/decorators/current-game.decorator';
import { GameModel } from 'src/shared/schemas/game.schema';
import { ModelTrainingService } from './mode-training.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { TrainingRequestDto } from './dto/input/training-request';
import { TrainingErrorDto } from './dto/input/training-error.dto';

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
}
