import { WebSocketMessageType, WebSocketMsg } from "./websocket/websocket-types";
import { WebSocketService } from "./websocket/websocket.service";

export class ClockSyncService {
    private offset: number | null = null;
    private websocketService = WebSocketService.getInstance();
  
    private static instance: ClockSyncService | null = null;
  
    private constructor() {
      this.websocketService.onMessageType('clock_sync', this.handleSyncResponse);
    }


    static getInstance(): ClockSyncService {
      if (!ClockSyncService.instance) {
        ClockSyncService.instance = new ClockSyncService();
      }
      return ClockSyncService.instance;
    }
  
    public sync() {
      const clientSent = Date.now();
      this.websocketService.sendMessage({
        type: WebSocketMessageType.CLOCK_SYNC,
        data: { client_sent: clientSent }
      });
    }
  
    private handleSyncResponse = (message: WebSocketMsg) => {
      const { client_sent, server_received } = message.data;
      const clientReceived = Date.now();
      
      const roundTripTime = clientReceived - client_sent;
      const latency = roundTripTime / 2;
      this.offset = (server_received - client_sent) - latency;
      console.warn('Clock sync offset:', this.offset + "ms");
    };
  
    public serverTimeToClient(serverTimestamp: number): number {
    if (this.offset === null) {
        throw new Error('Clock sync offset is not set.');
    }
      return serverTimestamp - this.offset;
    }
  }