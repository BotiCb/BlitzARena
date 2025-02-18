import { IsString } from "class-validator";

export class TrainingErrorDto {
  @IsString()
  errorMessage: string;
}
