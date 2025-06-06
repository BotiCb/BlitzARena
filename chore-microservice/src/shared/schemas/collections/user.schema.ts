import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class UserModel extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  hashedPassword: string;

  @Prop({ default: '' })
  photoUrl: string;

  @Prop()
  bio: string;

  @Prop({ default: null })
  lastLogin: Date;

  @Prop({ default: [] })
  lastAction: Date[];

  @Prop()
  refreshTokenHash?: string;

  @Prop()
  recentSessionId?: string;

  @Prop()
  recentGameId?: string;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);
