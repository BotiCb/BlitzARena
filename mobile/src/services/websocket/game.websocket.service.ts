import { AbstractCustomWebSocketService } from './custom-websocket.abstract-service';
import { WebSocketMsg } from './websocket-types';
import { WebSocketService } from './websocket.service';

export class GameWebSocketService extends AbstractCustomWebSocketService {
  setGameInfoEventListener(eventListener: (message: WebSocketMsg) => void) {
    this.websocketService.onMessageType('game_info', eventListener);
  }
}
