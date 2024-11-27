

type WebSocketListener = (message: string) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private listeners: WebSocketListener[] = [];

  // Connect to WebSocket server
  connect(url: string): void {
    if (this.ws) {
      console.warn('WebSocket is already connected');
      return;
    }

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
    };

    this.ws.onmessage = (event: MessageEvent) => {
      console.log('Received message:', event.data);
      this.listeners.forEach((listener) => listener(event.data));
    };

    this.ws.onerror = (error: Event) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
      this.ws = null;
    };
  }

  // Send a message through the WebSocket connection
  sendMessage(message: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message);
      console.log('Sent message:', message);
    } else {
      console.error('WebSocket is not connected');
    }
  }

  // Register a listener for incoming messages
  onMessage(listener: WebSocketListener): void {
    this.listeners.push(listener);
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
}

const webSocketService = new WebSocketService();

export default webSocketService;
