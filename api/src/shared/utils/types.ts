export type ServiceApiName = 'lobbyApi' | 'modelTrainerApi';

export enum PlayerConnectionState {
    PENDING = 'pending',
    CONNECTED = 'connected',
    DISCONNECTED = 'disconnected',
    EXITED = 'exited',
}