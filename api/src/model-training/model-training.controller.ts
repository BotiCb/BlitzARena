import { Body, Controller, HttpException, Post, UploadedFile } from '@nestjs/common';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { UserModel } from 'src/shared/schemas/user.schema';
import { TrainingPhotoDto } from './dto/input/training-photo.dto';
import { PlayerInGameRole } from 'src/shared/decorators/user-roles.decorator';
import { CurrentGame } from 'src/shared/decorators/current-game.decorator';
import { GameModel } from 'src/shared/schemas/game.schema';
import { ModelTrainingService } from './mode-training.service';

@Controller('model-training')
export class ModelTrainingController {
    constructor(private readonly modelTrainingService: ModelTrainingService) {}

  @PlayerInGameRole()
  @Post('upload-photo')
  uploadPhoto(
    @CurrentUser() user: UserModel,
    @CurrentGame() game: GameModel,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: TrainingPhotoDto
  ) {

    if(!file) {
      throw new HttpException('No file uploaded', 400);
    }

    return this.modelTrainingService.sendTrainingPhoto(file, game, dto.playerId);
  }
}
