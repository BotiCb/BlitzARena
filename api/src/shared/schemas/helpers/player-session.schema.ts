import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from "mongoose";
import { UserModel } from "../collections/user.schema";

@Schema({ id: false })
export class PlayerSessionModel {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'UserModel' })
  userId: UserModel;

  @Prop({ required: true })
  sessionId: string;
}

export const PlayerSessionSchema = SchemaFactory.createForClass(PlayerSessionModel);
