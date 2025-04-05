import { UserModel } from "src/shared/schemas/collections/user.schema";

export class UserInfoDto {
  firstName: string;
  lastName: string;
  photoUrl: string;
  email: string;
  userId: string;

  constructor(user: UserModel) {
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.photoUrl = user.photoUrl;
    this.email = user.email;
    this.userId = user._id.toString();
  }
}

export class UserInfoToGameDto {
  firstName: string;
  lastName: string;
  photoUrl: string;
  userId: string;
  sessionId: string;

  constructor(user: UserModel, sessionId: string) {
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.photoUrl = user.photoUrl;
    this.userId = user._id.toString();
    this.sessionId = sessionId;
  }
}
