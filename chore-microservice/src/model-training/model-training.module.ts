import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { ModelTrainingController } from './model-training.controller';
import { ModelTrainingService } from './model-training.service';
import { PersonDetectionModule } from 'src/person-detection/person-detection.module';

@Module({
  imports: [PersonDetectionModule, SharedModule],
  controllers: [ModelTrainingController],
  providers: [ModelTrainingService],
})
export class ModelTrainingModule {}
