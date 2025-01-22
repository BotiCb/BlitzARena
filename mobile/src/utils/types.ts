export type UserInfo = {
  firstName: string;
  lastName: string;
  photoUrl: string;
  email: string;
  userId: string;
};

export enum LoginResponse {
  INVALID_INPUT = 'invalid_input',
  EMPTY_INPUT = 'empty_input',
  WRONG_CREDENTIALS = 'wrong_credentials',
  SERVER_ERROR = 'server_error',
}

export type LoginResponseType = LoginResponse | UserInfo;
