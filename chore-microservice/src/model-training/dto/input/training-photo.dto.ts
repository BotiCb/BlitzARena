import { IsPositive, IsString } from 'class-validator';

export class TrainingPhotoDto {
  @IsString()
  playerId: string;

  @IsString()
  photoSize: string;
}
