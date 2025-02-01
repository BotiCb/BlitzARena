export class LoginRequestDto {
  email: string;
  password: string;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }
}

export class CreateGameRequestDto {
  maxPlayers: number;

  constructor(maxPlayers: number) {
    this.maxPlayers = maxPlayers;
  }
}