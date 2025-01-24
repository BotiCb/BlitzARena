import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { LobbyModule } from './lobby/lobby.module';

@Module({
  imports: [UsersModule, AuthModule, LobbyModule],
})
export class AppModule {}
