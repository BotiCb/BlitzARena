export type WebSocketMsg = {
  type: WebSocketMessageType;
  data?: string;
};

export enum WebSocketMessageType {
  PING = 'ping',
  PONG = 'pong',
  TRAINING_START = 'training_start',
  TRAINING_DATA = 'training_data',
  TRAINING_END = 'training_end',
  TRAINING_READY_FOR_PLAYER = 'training_ready_for_player',
}

export type TrainingImage = {
  photo: string;
  detectedPlayer: string;
};
