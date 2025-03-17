import { WebSocketMessageType, WebSocketMsg } from "./websocket/websocket-types";
import { WebSocketService } from "./websocket/websocket.service";

export class ClockSyncService {
  private offset: number | null = null;
  private collectedOffsetCount = 0;
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
    const { clientSent, serverReceived } = message.data;
    const clientReceived = Date.now();
    this.collectedOffsetCount++;
    const roundTripTime = clientReceived - Number(clientSent);
    const latency = roundTripTime / 2;
    if (this.offset === null) {
      this.offset = (serverReceived - clientSent) - latency;
    }
    else {
      const currentOffset = (serverReceived - clientSent) - latency;
      //console.warn('Current offset:', currentOffset + "ms");
      this.offset = this.offset * (this.collectedOffsetCount - 1) / this.collectedOffsetCount + currentOffset / this.collectedOffsetCount;
    }
    //console.warn('Clock sync offset:', this.offset + "ms");
  };

  public serverTimeToClient(serverTimestamp: number): number {
    if (this.offset === null) {
      throw new Error('Clock sync offset is not set.');
    }
    return serverTimestamp - this.offset;
  }
}