import {  TrainingImage, WebSocketMessageType, WebSocketMsg } from "./utils/types";
import websocketService from "./websocket.service";

class ModelTrainingWebSocketService {


  setTrainingReadyForPlayerEventListener(eventListener: () => void) {
    websocketService.onMessageType('training_ready_for_player', eventListener);
  }

  sendTrainingImage(trainingImage: TrainingImage) {
    const wsMessage: WebSocketMsg = {
      type: WebSocketMessageType.TRAINING_DATA,
      user_id: '1',
      data: JSON.stringify(trainingImage),
    }
    websocketService.sendMessage(wsMessage);
  }

  sendStartModelTraining() {
    const wsMessage: WebSocketMsg = {
      type: WebSocketMessageType.TRAINING_START,
      user_id: '1',
    }
    websocketService.sendMessage(wsMessage);
  }


}

export default new ModelTrainingWebSocketService();