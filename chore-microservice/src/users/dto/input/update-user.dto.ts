import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { CreateUserDto } from 'src/auth/dto/input/create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  bio: string;

  @IsOptional()
  @IsString()
  newPassword: string;

  
}
