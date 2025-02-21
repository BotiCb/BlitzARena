import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


@Schema({ _id: false })
class Metadata {
  @Prop({ required: true })
  task: string;

  @Prop({ required: true })
  totalEpochs: number;

  @Prop({ type: [String], required: true })
  classNames: string[];
}

@Schema({ _id: false })
class LearningRates {
  @Prop({ required: true })
  pg0: number;

  @Prop({ required: true })
  pg1: number;

  @Prop({ required: true })
  pg2: number;
}

@Schema({ _id: false })
class Training {
  @Prop({ required: true })
  loss: number;

  @Prop({ type: LearningRates, required: true })
  learningRates: LearningRates;
}

@Schema({ _id: false })
class Validation {
  @Prop({ required: true })
  loss: number;

  @Prop({ required: true })
  accuracyTop1: number;

  @Prop({ required: true })
  accuracyTop5: number;
}

@Schema({ _id: false })
class Epoch {
  @Prop({ required: true })
  epoch: number;

  @Prop({ required: true })
  time: number;

  @Prop({ type: Training, required: true })
  training: Training;

  @Prop({ type: Validation, required: true })
  validation: Validation;
}

@Schema({ _id: false })
class ConfusionMatrix {
  @Prop({ type: [[Number]], required: true })
  matrix: number[][];

  @Prop({ type: [String], required: true })
  classNames: string[];

  @Prop({ required: true })
  normalized: boolean;
}

@Schema({ _id: false })
class FinalMetrics {
  @Prop({ required: true })
  metricsAccuracyTop1: number;

  @Prop({ required: true })
  metricsAccuracyTop5: number;

  @Prop({ required: true })
  fitness: number;
}

@Schema({ _id: false })
class MetricsSummary {
  @Prop({ required: true })
  fitness: number;

  @Prop({ required: true })
  top1Accuracy: number;

  @Prop({ required: true })
  top5Accuracy: number;

  @Prop({ type: ConfusionMatrix, required: true })
  confusionMatrix: ConfusionMatrix;

  @Prop({ type: FinalMetrics, required: true })
  finalMetrics: FinalMetrics;
}

@Schema({ _id: false })
class System {
  @Prop({ required: true })
  preprocessMs: number;

  @Prop({ required: true })
  inferenceMs: number;

  @Prop({ required: true })
  postprocessMs: number;

  @Prop({ required: true })
  lossCalculationMs: number;

  @Prop({ required: true })
  concurentTrainings: number;
}

@Schema({ _id: false })
class Metrics {
  @Prop({ type: MetricsSummary, required: true })
  summary: MetricsSummary;

  @Prop({ type: [Epoch], required: true })
  epochs: Epoch[];

  @Prop({ type: System, required: true })
  system: System;
}

@Schema({ _id: false })
export class TrainingResults {
  @Prop({ type: Metadata, required: true })
  metadata: Metadata;

  @Prop({ type: Metrics, required: true })
  metrics: Metrics;
}

export const TrainingResultsSchema = SchemaFactory.createForClass(TrainingResults);

