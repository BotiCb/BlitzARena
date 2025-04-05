import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { ModelTrainingController } from './model-training.controller';
import { ModelTrainingService } from './model-training.service';

@Module({
  imports: [SharedModule],
  controllers: [ModelTrainingController],
  providers: [ModelTrainingService],
})
export class ModelTrainingModule {}
