import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { LobbyController } from './lobby.controller';

@Module({
    imports: [SharedModule],
    controllers: [LobbyController],
})
export class LobbyModule {}
