import { UserModel } from 'src/shared/schemas/user.schema';

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
