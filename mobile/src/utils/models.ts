import { TEAM } from './types';

export class Player {
  sessionID: string;
  isConnected: boolean;
  isHost: boolean;
  team: TEAM | null;
  isReady?: boolean;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;

  constructor(sessionID: string, isConnected: boolean, isHost: boolean, team: TEAM | null = null) {
    this.sessionID = sessionID;
    this.isConnected = isConnected;
    this.isHost = isHost;
    this.team = team;
  }
}
