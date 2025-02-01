import { WebSocketMsg } from './websocket-types';

import { FASTAPI_BASE_URL } from '~/utils/constants';

type WebSocketListener = (message: any) => void;

export class WebSocketService {
  private static instance: WebSocketService | null = null; // Singleton instance
  private ws: WebSocket | null = null;
  private messageHandlers: { [key: string]: WebSocketListener } = {};
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 2000;
  private gameId: string | null = null;
  private userSessionId: string | null = null;

  private constructor() {} // Private constructor to prevent direct instantiation

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  connect(gameId: string, userSessionId: string): WebSocket {
    if (this.ws) {
      return this.ws;
    }

    this.ws = new WebSocket(`${FASTAPI_BASE_URL}/${gameId}/player/${userSessionId}`);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event: MessageEvent) => {
      this.handleMessage(event.data);
    };

    this.ws.onerror = (error: Event) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = (event: CloseEvent) => {
      console.log('WebSocket connection closed:', event.reason);
      this.ws = null;

      // if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
      //   this.reconnect();
      // } else {
      //   console.warn('Max reconnect attempts reached or connection closed cleanly');
      // }
    };

    return this.ws;
  }

  sendMessage(message: WebSocketMsg): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const messageString = JSON.stringify(message);
      this.ws.send(messageString);
      console.log('Sent message:', message.type);
    } else {
      console.error('WebSocket is not connected');
    }
  }

  onMessageType(type: string, handler: WebSocketListener): void {
    this.messageHandlers[type] = handler;
  }

  close(): void {
    if (this.ws) {
      this.ws.close();
      console.log('WebSocket closed manually');
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  handleMessage(message: string): void {
    try {
      const parsedMessage = JSON.parse(message) as WebSocketMsg;
      const type = parsedMessage.type;
      if (this.messageHandlers[type]) {
        this.messageHandlers[type](parsedMessage);
      } else {
        console.log('No handler registered for message type:', type);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  }

  // private reconnect(): void {
  //   this.reconnectAttempts++;
  //   console.log(
  //     `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
  //   );

  //   setTimeout(() => {
  //     if (this.gameId && this.userSessionId) {
  //       this.connect(this.gameId, this.userSessionId);
  //     } else {
  //       console.error('Reconnect failed: URL is not stored');
  //     }
  //   }, this.reconnectDelay);
  // }

  isConnected(): boolean {
    return !!this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

export const webSocketService = WebSocketService.getInstance();
