import { IsNumber, IsPositive } from 'class-validator';

export class CreateGameDto {
  @IsPositive()
  @IsNumber()
  maxPlayers: number;
}
