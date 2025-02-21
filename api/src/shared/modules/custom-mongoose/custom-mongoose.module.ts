import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from 'src/shared/config/config';
import { GameModel, GameSchema } from 'src/shared/schemas/collections/game.schema';
import { TrainingSessionModel, TrainingSessionSchema } from 'src/shared/schemas/collections/training-session.schema';
import { UserModel, UserSchema } from 'src/shared/schemas/collections/user.schema';


@Module({
  imports: [
    MongooseModule.forRoot(config.get('db.url')),
    MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema, collection: 'User' }]),
    MongooseModule.forFeature([{ name: GameModel.name, schema: GameSchema, collection: 'Game' }]),
    MongooseModule.forFeature([
      { name: TrainingSessionModel.name, schema: TrainingSessionSchema, collection: 'TrainingSession' },
    ]),
  ],
  exports: [
    MongooseModule.forRoot(config.get('db.url')),
    MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema, collection: 'User' }]),
    MongooseModule.forFeature([{ name: GameModel.name, schema: GameSchema, collection: 'Game' }]),
    MongooseModule.forFeature([
      { name: TrainingSessionModel.name, schema: TrainingSessionSchema, collection: 'TrainingSession' },
    ]),
  ],
})
export class CustomMongooseModule {}
