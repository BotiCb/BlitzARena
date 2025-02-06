import { AbstractCustomWebSocketService } from './custom-websocket.abstract-service';
import { TrainingImage, WebSocketMessageType, WebSocketMsg } from './websocket-types';

export class ModelTrainingWebSocketService extends AbstractCustomWebSocketService {
  private isSendingPhotos: boolean = false;
  private photoQueue: TrainingImage[] = [];

  setWebSocketEventListeners(): void {
    
  }

  setTrainingReadyForPlayerEventListener(eventListener: () => void) {
    this.websocketService.onMessageType('training_ready_for_player', eventListener);
  }

  private sendTrainingImage(trainingImage: TrainingImage) {
    const wsMessage: WebSocketMsg = {
      type: WebSocketMessageType.TRAINING_DATA,
      data: JSON.stringify(trainingImage),
    };
    this.websocketService.sendMessage(wsMessage);
  }

  sendStartModelTraining() {
    const wsMessage: WebSocketMsg = {
      type: WebSocketMessageType.TRAINING_START,
    };
    this.websocketService.sendMessage(wsMessage);
  }

  addPhotoToQueue(trainingImage: TrainingImage) {
    this.photoQueue.push(trainingImage);
  }

  async sendPhoto(trainingImage: TrainingImage) {
    this.addPhotoToQueue(trainingImage);

    if (this.isSendingPhotos) {
      return;
    }

    this.isSendingPhotos = true;

    while (this.photoQueue.length > 0) {
      const photo: TrainingImage | undefined = this.photoQueue.shift();

      if (photo) {
        try {
          this.sendTrainingImage(photo);
        } catch (error) {
          console.error('Error sending photo:', error);
          this.photoQueue.unshift(photo); 
          break;
        }
      }
    }

    this.isSendingPhotos = false;
  }
  close(): void {
    
  }
}
