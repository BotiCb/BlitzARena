import { UserModel } from 'src/shared/schemas/user.schema';

export class DetailedUserProfileDto {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  bio: string;
  email: string;
  lastLogin: Date;

  constructor(user: UserModel) {
    this.id = user._id.toString();
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.photoUrl = user.photoUrl;
    this.bio = user.bio;
    this.email = user.email;
  }
}

export class InGameUserInfoDto {
  firstName: string;
  lastName: string;
  photoUrl: string;
  sessionId: string;

  constructor(user: UserModel) {
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.photoUrl = user.photoUrl;
    this.sessionId = user.recentSessionId;
  }
}
