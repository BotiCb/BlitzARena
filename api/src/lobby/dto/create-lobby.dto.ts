import { IsNumber, IsPositive } from "class-validator"

export class CreateLobbyDto {
    @IsPositive()
    @IsNumber()
    maxPlayers: number
}