import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { UserModel } from './user.schema';

@Schema({id: false})
export class PlayerSession {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'UserModel' })
  userId: UserModel;

  @Prop({ required: true })
  sessionId: string;
}

const PlayerSessionSchema = SchemaFactory.createForClass(PlayerSession);

@Schema({ timestamps: true })
export class GameModel extends Document {
  @Prop({ required: true })
  gameId: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'UserModel', index: true })
  creatorUser: UserModel;

  @Prop({ required: true, type: [PlayerSessionSchema] })
  players: PlayerSession[];
}

export const GameSchema = SchemaFactory.createForClass(GameModel);
