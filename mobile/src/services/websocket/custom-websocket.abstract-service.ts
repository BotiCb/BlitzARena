import { WebSocketService } from './websocket.service';

export abstract class AbstractCustomWebSocketService {
  protected websocketService: WebSocketService = WebSocketService.getInstance();
  private static instances: { [key: string]: AbstractCustomWebSocketService } = {};

  static getInstance<T extends AbstractCustomWebSocketService>(this: new () => T): T {
    if (!AbstractCustomWebSocketService.instances[this.name]) {
      AbstractCustomWebSocketService.instances[this.name] = new this();
    }
    return AbstractCustomWebSocketService.instances[this.name] as T;
  }
}
