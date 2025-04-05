import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GameModule } from './game/game.module';
import { ModelTrainingModule } from './model-training/model-training.module';

@Module({
  imports: [UsersModule, AuthModule, GameModule, ModelTrainingModule],
})
export class AppModule {}
