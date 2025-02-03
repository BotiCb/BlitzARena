export type WebSocketMsg = {
  type: WebSocketMessageType;
  data?: any;
};

export enum WebSocketMessageType {
  PING = 'ping',
  PONG = 'pong',
  TRAINING_START = 'training_start',
  TRAINING_DATA = 'training_data',
  TRAINING_END = 'training_end',
  TRAINING_READY_FOR_PLAYER = 'training_ready_for_player',
  SET_PLAYER_AS_HOST = 'set_host',
  REMOVE_PLAYER = 'remove_player',
}

export type TrainingImage = {
  photo: string;
  detectedPlayer: string;
};

export type PlayerWSInfo = {
  playerId: string;
  isConnected: boolean;
  isHost: boolean;
  isReady: boolean;
};
