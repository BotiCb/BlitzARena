import { Injectable } from '@nestjs/common';
import { UserProfileDto } from './dto/output/user-profile.dto';
import { UserModel } from '../shared/schemas/user.schema';

import { UserInfoDto } from './dto/output/user-info.dto';

import { DetailedUserProfileDto } from './dto/output/detailed-user-profile';

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
}
