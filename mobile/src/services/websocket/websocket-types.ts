export type WebSocketMsg = {
  type: WebSocketMessageType;
  data?: any;
};

export enum WebSocketMessageType {
  PING = 'ping',
  PONG = 'pong',
  TRAINING_START = 'training_start',
  TRAINING_PHOTO_SENT = 'training_photo_sent',
  TRAINING_END = 'training_end',
  TRAINING_READY_FOR_PLAYER = 'training_ready_for_player',
  SET_PLAYER_AS_HOST = 'set_host',
  REMOVE_PLAYER = 'remove_player',
  SET_MY_STATE = 'set_player_ready',
  NEXT_GAME_PHASE = 'start_next_phase',
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
  isReady: boolean;
};

export type GameWSInfo = {
  gameId: string;
  players: PlayerWSInfo[];
  currentPhase: string;
  max_players: number;
};
