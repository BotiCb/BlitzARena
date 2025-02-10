import { IsString } from "class-validator";

export class TrainingPhotoDto {
    @IsString()
    playerId: string;

    @IsString()
    gameId: string;
}