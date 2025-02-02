export class Player {
  sessionID: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  isConnected: boolean;
  isHost: boolean;
  isReady: boolean;

  constructor(
    sessionID: string,
    firstName: string,
    lastName: string,
    photoUrl: string,
    isConnected: boolean,
    isHost: boolean,
    isReady: boolean
  ) {
    this.sessionID = sessionID;
    this.firstName = firstName;
    this.lastName = lastName;
    this.photoUrl = photoUrl;
    this.isConnected = isConnected;
    this.isHost = isHost;
    this.isReady = isReady;
  }
}
