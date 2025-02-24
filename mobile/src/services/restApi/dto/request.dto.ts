export class LoginRequestDto {
  email: string;
  password: string;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }
}

export class RegisterRequestDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;

  constructor(firstName: string, lastName: string, email: string, password: string) {
    this.firstName = firstName;
    this.lastName = lastName;
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

export class TfliteModelDto {
  modelBase64: string;
  labels: string[];

  constructor(modelBase64: string, labels: string[]) {
    this.modelBase64 = modelBase64;
    this.labels = labels;
  }
}
