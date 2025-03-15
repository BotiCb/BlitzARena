import { BODY_PART } from '~/utils/types/detection-types';
import { GamePhase, TEAM } from '~/utils/types/types';

export type WebSocketMsg = {
  type: WebSocketMessageType;
  data?: any;
};

export enum WebSocketMessageType {
  PING = 'ping',
  PONG = 'pong',
  TRAINING_START = 'training_start',
  READY_FOR_PHASE = 'ready_for_phase',
  TRAINING_PHOTO_SENDING = 'training_photo_sending',
  TRAINING_PHOTO_SENT = 'training_photo_sent',
  TRAINING_END = 'training_end',
  TRAINING_READY_FOR_PLAYER = 'training_ready_for_player',
  SET_PLAYER_AS_HOST = 'set_host',
  REMOVE_PLAYER = 'remove_player',
  SET_MY_STATE = 'set_player_ready',
  NEXT_GAME_PHASE = 'start_next_phase',
  SELECT_TEAM = 'select_team',
  PLAYER_LOCATION = 'player_location',
  GAME_AREA_CHANGE = 'game_area_change',
  SHOOT = 'player_shoot',
  RELOAD_GUN = 'player_reload',
  CLOCK_SYNC= 'clock_sync',
}

export type TrainingImage = {
  photoUri: string;
  detectedPlayer: string;
  photoSize: number;
};

export type PlayerWSInfo = {
  playerId: string;
  isConnected: boolean;
  isHost: boolean;
  team: TEAM | null;
};

export type GameWSInfo = {
  gameId: string;
  players: PlayerWSInfo[];
  currentPhase: GamePhase;
  maxPlayers: number;
  isModelTrained: boolean;
  trainingProgress: number;
};


export type HitPerson = {
  hitPlayerId: string;
  confidence: number;
  bodyPart: BODY_PART;
};