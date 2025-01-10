import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserMapper } from './users.mapper';
import { SharedModule } from 'src/shared/shared.module';
@Module({
  imports: [SharedModule],
  controllers: [UsersController],
  providers: [UsersService, UserMapper],
  exports: [UsersService],
})
export class UsersModule {}
