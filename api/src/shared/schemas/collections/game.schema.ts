import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { UserModel } from './user.schema';
import { TrainingSessionModel } from './training-session.schema';
import { PlayerSessionSchema, PlayerSessionModel } from '../helpers/player-session.schema';




@Schema({ timestamps: true })
export class GameModel extends Document {
  @Prop({ required: true })
  gameId: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'UserModel', index: true })
  creatorUser: UserModel;

  @Prop({ required: true, type: [PlayerSessionSchema] })
  players: PlayerSessionModel[];

  @Prop({ default: null, type: MongooseSchema.Types.ObjectId, ref: 'TrainingSessionModel' })
  trainingSession: TrainingSessionModel;

  @Prop({ default: [], type: [MongooseSchema.Types.ObjectId], ref: 'TrainingSessionModel' })
  unsuccessfulTrainingSessions: TrainingSessionModel[];

  @Prop({ default: null })
  endedAt: Date;
}

export const GameSchema = SchemaFactory.createForClass(GameModel);
