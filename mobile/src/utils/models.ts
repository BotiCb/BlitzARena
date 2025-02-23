export class Player {
  sessionID: string;
  isConnected: boolean;
  isHost: boolean;
  isReady?: boolean;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;

  constructor(sessionID: string, isConnected: boolean, isHost: boolean, isReady?: boolean) {
    this.sessionID = sessionID;
    this.isConnected = isConnected;
    this.isHost = isHost;
    this.isReady = isReady;
  }
}
