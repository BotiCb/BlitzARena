import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from "mongoose";
import { UserModel } from "../collections/user.schema";
import { PlayerConnectionState } from 'src/shared/utils/types';

@Schema({ id: false })
export class PlayerSessionModel {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'UserModel' })
  userId: UserModel;

  @Prop({ required: true })
  sessionId: string;

  @Prop({ required: true })
  connectionState: PlayerConnectionState;
}

export const PlayerSessionSchema = SchemaFactory.createForClass(PlayerSessionModel);
