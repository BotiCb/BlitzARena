import { Injectable } from '@nestjs/common';
import { UserProfileDto } from './dto/output/user-profile.dto';
import { UserModel } from 'src/shared/schemas/collections/user.schema';

import { UserInfoDto } from './dto/output/user-info.dto';

import { DetailedUserProfileDto, InGameUserInfoDto } from './dto/output/detailed-user-profile';

@Injectable()
export class UserMapper {
  constructor() {}

  toUserProfileDto(user: UserModel): UserProfileDto {
    return new UserProfileDto(user);
  }

  fromUserModelToUserInfoDto(user: UserModel): UserInfoDto {
    return new UserInfoDto(user);
  }

  toDetailedUserInfoDto(user: UserModel): DetailedUserProfileDto {
    return new DetailedUserProfileDto(user);
  }

  fromUserModelToInGameUserInfoDto(user: UserModel): InGameUserInfoDto {
    return new InGameUserInfoDto(user);
  }
}
