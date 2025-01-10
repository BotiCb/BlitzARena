import { UserModel } from 'src/shared/schemas/user.schema';
export class UserProfileDto {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  bio: string;
  createdAt: Date;
  email: string;

  constructor(user: UserModel) {
    this.id = user._id.toString();
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.photoUrl = user.photoUrl;
    this.bio = user.bio;
    this.createdAt = user.createdAt;
    this.email = user.email;
  }
}
