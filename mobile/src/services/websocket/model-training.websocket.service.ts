import RNFS from 'react-native-fs';

import { AbstractCustomWebSocketService } from './custom-websocket.abstract-service';
import { TrainingImage, WebSocketMessageType } from './websocket-types';
import { MODEL_TRAINING_ENDPOINTS } from '../restApi/Endpoints';
import { apiClient } from '../restApi/RestApiService';

export class ModelTrainingWebSocketService extends AbstractCustomWebSocketService {
  private isSendingPhotos: boolean = false;
  private photoQueue: TrainingImage[] = [];
  private isTakingPhotosHandlerFunction: (takePhotos: boolean) => void = () => {};
  setWebSocketEventListeners(): void {
    this.websocketService.onMessageType(
      'training_ready_for_player',
      this.trainingReadyForPlayerEventListener
    );
  }

  setTakingPhotosHandlerFunction(handler: (takePhotos: boolean) => void) {
    this.isTakingPhotosHandlerFunction = handler;
  }
  trainingReadyForPlayerEventListener = () => {
    this.isTakingPhotosHandlerFunction(false);
    this.photoQueue = [];
  };

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
          await this.sendTrainingPhoto(photo);
        } catch {
          this.photoQueue.unshift(photo);
          break;
        }
      }
    }

    this.isSendingPhotos = false;
  }

  private async sendTrainingPhoto(trainingImage: TrainingImage) {
    this.websocketService.sendMessage({
      type: WebSocketMessageType.TRAINING_PHOTO_SENT,
      data: {
        detectedPlayer: trainingImage.detectedPlayer,
      },
    });
    const formData = new FormData();
    formData.append('file', {
      uri: trainingImage.photoUri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    } as any);

    formData.append('playerId', trainingImage.detectedPlayer);
    formData.append('gameId', ModelTrainingWebSocketService.gameId);
    formData.append('photoSize', trainingImage.photoSize.toString());
    console.log(formData);
    const response = await apiClient.post(MODEL_TRAINING_ENDPOINTS.UPLOAD_PHOTO, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log(response.status);
    RNFS.unlink(trainingImage.photoUri);
  }
  close(): void {
    this.websocketService.offMessageType('training_ready_for_player');
  }
}
