import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class TrainingSessionModel extends Document {
  @Prop({ required: true })
  inProgress: boolean;

  @Prop({ required: true })
  photoSize: number;

  @Prop()
  numClasses: number;

  @Prop()
  numImagesPerClass: number;

  @Prop({ default: null })
  startedAt: Date;

  @Prop({ default: null })
  endedAt: Date;

  @Prop({ default: null })
  errorMessage: string;
}

export const TrainingSessionSchema = SchemaFactory.createForClass(TrainingSessionModel);
