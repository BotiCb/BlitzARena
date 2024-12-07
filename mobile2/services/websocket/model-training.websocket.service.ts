import {  TrainingImage, WebSocketMessageType, WebSocketMsg } from "./utils/types";
import websocketService from "./websocket.service";

class ModelTrainingWebSocketService {
  constructor() {
    websocketService.onMessageType('training-start', (message : string) => {
        console.log('Received training-start notification:', message);
      });
  }

  sendTrainingImage(trainingImage: TrainingImage) {
    const wsMessage: WebSocketMsg = {
      type: WebSocketMessageType.TRAINING_DATA,
      user_id: '1',
      data: JSON.stringify(trainingImage),
    }
    websocketService.sendMessage(wsMessage);
  }
}

export default new ModelTrainingWebSocketService();