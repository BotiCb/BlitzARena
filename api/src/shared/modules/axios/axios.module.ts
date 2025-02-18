import { Module } from '@nestjs/common';
import { AxiosService } from './axios.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [JwtService, AxiosService],
  exports: [AxiosService],
})
export class AxiosModule {}
