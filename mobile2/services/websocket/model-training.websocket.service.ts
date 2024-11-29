import {  WebSocketMessageType, WebSocketMsg } from "./utils/types";
import websocketService from "./websocket.service";

class ModelTrainingWebSocketService {
  constructor() {
    websocketService.onMessageType('training-start', (message : string) => {
        console.log('Received training-start notification:', message);
      });
  }

  sendImage(image: string) {
    const wsMessage: WebSocketMsg = {
      type: WebSocketMessageType.TRAINING_DATA,
      user_id: '1',
      data: image
    }
    websocketService.sendMessage(wsMessage);
  }
}

export default new ModelTrainingWebSocketService();