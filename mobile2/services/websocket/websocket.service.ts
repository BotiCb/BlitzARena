import { WebSocketMsg } from "./utils/types";

type WebSocketListener = (message: any) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private listeners: WebSocketListener[] = [];
  private messageHandlers: { [key: string]: WebSocketListener } = {}; // Store message handlers dynamically

  
  connect(url: string): WebSocket {
    if (this.ws) {
      return this.ws;
    }

    this.ws = new WebSocket(url);
    

    this.ws.onopen = () => {
      console.log('WebSocket connected');
    };

    this.ws.onmessage = (event: MessageEvent) => {
      console.log('Received message:', event.data);
      this.handleMessage(event.data); // Handle message based on type
    };

    this.ws.onerror = (error: Event) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
      this.ws = null;
    };
    return this.ws;
  }

  // Send a message through the WebSocket connection
  sendMessage(message: WebSocketMsg): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const messageString = JSON.stringify(message);
      this.ws.send(messageString);
      console.log('Sent message');
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
      console.log('WebSocket closed');
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  // Handle incoming messages and dynamically dispatch to the appropriate handler
  handleMessage(message: string): void {
    try {
      const parsedMessage = JSON.parse(message); // Parse the message as JSON
      const { type } = parsedMessage; // Get the message type

      // If a handler is registered for this type, call it
      if (this.messageHandlers[type]) {
        this.messageHandlers[type](parsedMessage); // Execute the handler for the specific type
      } else {
        console.log('No handler registered for message type:', type);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  }
}


export default new WebSocketService();
