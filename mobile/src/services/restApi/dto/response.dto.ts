export class UserInfoResponseDto {
  firstName: string;
  lastName: string;
  photoUrl: string;
  email: string;
  userId: string;

  constructor(
    firstName: string,
    lastName: string,
    photoUrl: string,
    email: string,
    userId: string,
  ) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.photoUrl = photoUrl;
    this.email = email;
    this.userId = userId;
  }
}

export enum LoginResponse {
  INVALID_INPUT = 'invalid_input',
  EMPTY_INPUT = 'empty_input',
  WRONG_CREDENTIALS = 'wrong_credentials',
  SERVER_ERROR = 'server_error',
}

export type LoginResponseType = LoginResponse | UserInfoResponseDto;
