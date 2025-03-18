import { TEAM } from './types/types';

export class Player {
  sessionID: string;
  isConnected: boolean;
  isHost: boolean;
  team: TEAM | null;
  isReady?: boolean;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
  deaths: number = 0;
  kills: number = 0;

  constructor(sessionID: string, isConnected: boolean, isHost: boolean, team: TEAM | null = null, kills: number = 0, deaths: number = 0) {
    this.sessionID = sessionID;
    this.isConnected = isConnected;
    this.isHost = isHost;
    this.team = team;
    this.kills = kills;
    this.deaths = deaths;
  }
}
