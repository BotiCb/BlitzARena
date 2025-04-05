export type ServiceApiName = 'gameSessionMicroService' | 'modelTrainerMicroService';

export enum PlayerConnectionState {
    PENDING = 'pending',
    CONNECTED = 'connected',
    DISCONNECTED = 'disconnected',
    EXITED = 'exited',
}