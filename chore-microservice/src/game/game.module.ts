import { Logger, Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { JwtModule } from '@nestjs/jwt';
import { AxiosService } from 'src/shared/modules/axios/axios.service';

@Module({
  imports: [SharedModule, JwtModule],
  controllers: [GameController],
  providers: [GameService, Logger, AxiosService],
})
export class GameModule {}
