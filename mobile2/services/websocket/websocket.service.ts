import { WebSocketMsg } from "./utils/types";

type WebSocketListener = (message: any) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private listeners: WebSocketListener[] = [];
  private messageHandlers: { [key: string]: WebSocketListener } = {};
  private reconnectAttempts: number = 0; // Track reconnection attempts
  private maxReconnectAttempts: number = 5; // Maximum retries
  private reconnectDelay: number = 2000; // Delay between retries in milliseconds
  private url: string | null = null; // Store the URL for reconnection

  connect(url: string): WebSocket {
    if (this.ws) {
      return this.ws;
    }

    this.url = url; // Store the URL for potential reconnects
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0; // Reset the reconnect attempts on successful connection
    };

    this.ws.onmessage = (event: MessageEvent) => {
      //console.log('Received message:', event.data);
      this.handleMessage(event.data);
    };

    this.ws.onerror = (error: Event) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = (event: CloseEvent) => {
      console.log('WebSocket connection closed:', event.reason);
      this.ws = null;

      // Attempt reconnection if the closure was abnormal (not a manual close)
      if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnect();
      } else {
        console.warn('Max reconnect attempts reached or connection closed cleanly');
      }
    };

    return this.ws;
  }

  // Send a message through the WebSocket connection
  sendMessage(message: WebSocketMsg): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const messageString = JSON.stringify(message);
      this.ws.send(messageString);
      console.log('Sent message:', message.type);
    } else {
      console.error('WebSocket is not connected');
    }
  }

  // Register a listener for incoming messages (generic)
  onMessage(listener: WebSocketListener): void {
    this.listeners.push(listener);
  }

  // Register a handler for a specific message type dynamically
  onMessageType(type: string, handler: WebSocketListener): void {
    this.messageHandlers[type] = handler;
  }

  // Close the WebSocket connection
  close(): void {
    if (this.ws) {
      this.ws.close();
      console.log('WebSocket closed manually');
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  // Handle incoming messages and dynamically dispatch to the appropriate handler
  handleMessage(message: string): void {
    try {
      const parsedMessage = JSON.parse(message);
      const { type } = parsedMessage;

      if (this.messageHandlers[type]) {
        this.messageHandlers[type](parsedMessage);
      } else {
        console.log('No handler registered for message type:', type);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  }

  // Reconnect with a delay
  private reconnect(): void {
    this.reconnectAttempts++;
    console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      if (this.url) {
        this.connect(this.url); // Reconnect using the stored URL
      } else {
        console.error('Reconnect failed: URL is not stored');
      }
    }, this.reconnectDelay);
  }
}

export default new WebSocketService();
