import { Detection, TrainingImageLabel } from "@/utils/types"

export type WebSocketMsg ={
    type: WebSocketMessageType,
    user_id?: string,
    data?: string
}

export enum WebSocketMessageType {
    PING = 'ping',
    PONG = 'pong',
    TRAINING_START = 'training_start',
    TRAINING_DATA = 'training_data',
    TRAINING_END = 'training_end',
}


export type TrainingImage={
    photo: string,
    label: TrainingImageLabel,
    detectedPlayer: string
}