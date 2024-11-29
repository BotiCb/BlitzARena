export type WebSocketMsg ={
    type: WebSocketMessageType,
    user_id?: string,
    data?: string
}

export enum WebSocketMessageType {
    PING = 'ping',
    PONG = 'pong',
    TRAINING_START = 'training-start',
    TRAINING_DATA = 'training-data',
    TRAINING_END = 'training-end',
}