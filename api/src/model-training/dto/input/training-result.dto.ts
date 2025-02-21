import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

// Helper DTOs
class MetadataDto {
  @IsString()
  task: string;

  @IsNumber()
  totalEpochs: number;

  @IsArray()
  @IsString({ each: true })
  classNames: string[];
}

class LearningRatesDto {
  @IsNumber()
  pg0: number;

  @IsNumber()
  pg1: number;

  @IsNumber()
  pg2: number;
}

class TrainingDto {
  @IsNumber()
  loss: number;

  @ValidateNested()
  @Type(() => LearningRatesDto)
  learningRates: LearningRatesDto;
}

class ValidationDto {
  @IsNumber()
  loss: number;

  @IsNumber()
  accuracyTop1: number;

  @IsNumber()
  accuracyTop5: number;
}

class EpochDto {
  @IsNumber()
  epoch: number;

  @IsNumber()
  time: number;

  @ValidateNested()
  @Type(() => TrainingDto)
  training: TrainingDto;

  @ValidateNested()
  @Type(() => ValidationDto)
  validation: ValidationDto;
}
class ConfusionMatrixDto {
    
    matrix: number[][];
  
    
    classNames: string[];
  
  
    normalized: boolean;
  }
  
  class FinalMetricsDto {
    @Expose({ name: 'metrics/accuracyTop1' })
    @IsNumber()
    metricsAccuracyTop1: number;
  
    @Expose({ name: 'metrics/accuracyTop5' })
    @IsNumber()
    metricsAccuracyTop5: number;
  
    @IsNumber()
    fitness: number;
  }
  
  class MetricsSummaryDto {
    @IsNumber()
    fitness: number;
  
    @IsNumber()
    top1Accuracy: number;
  
    @IsNumber()
    top5Accuracy: number;
  
    @ValidateNested()
    @Type(() => ConfusionMatrixDto)
    confusionMatrix: ConfusionMatrixDto;
  
    @ValidateNested()
    @Type(() => FinalMetricsDto)
    finalMetrics: FinalMetricsDto;
  }

class SystemDto {
  @IsNumber()
  preprocessMs: number;

  @IsNumber()
  inferenceMs: number;

  @IsNumber()
  postprocessMs: number;

  @IsNumber()
  lossCalculationMs: number;

  @IsNumber()
  concurentTrainings: number;
}

class MetricsDto {
  @ValidateNested()
  @Type(() => MetricsSummaryDto)
  summary: MetricsSummaryDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EpochDto)
  epochs: EpochDto[];

  @ValidateNested()
  @Type(() => SystemDto)
  system: SystemDto;
}

export class TrainingResultsDto {
  @ValidateNested()
  @Type(() => MetadataDto)
  metadata: MetadataDto;

  @ValidateNested()
  @Type(() => MetricsDto)
  metrics: MetricsDto;
}