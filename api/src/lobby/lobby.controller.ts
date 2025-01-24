import { Body, Controller, Post } from "@nestjs/common";
import { CurrentUser } from "src/shared/decorators/current-user.decorator";
import { UserRole } from "src/shared/decorators/user-roles.decorator";
import { UserModel } from "src/shared/schemas/user.schema";
import { CreateLobbyDto } from "./dto/create-lobby.dto";

@Controller('lobby')
export class LobbyController {

    @Post('create')
    @UserRole()
    createLobby(@CurrentUser() user: UserModel, @Body() createLobbyDto: CreateLobbyDto) {
        console.log(user.firstName, createLobbyDto.maxPlayers );
    }
}