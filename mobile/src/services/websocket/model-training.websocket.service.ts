import RNFS from 'react-native-fs';

import { AbstractCustomWebSocketService } from './custom-websocket.abstract-service';
import { TrainingImage, WebSocketMessageType, WebSocketMsg } from './websocket-types';
import { MODEL_TRAINING_ENDPOINTS } from '../restApi/Endpoints';
import { apiClient } from '../restApi/RestApiService';

export class ModelTrainingWebSocketService extends AbstractCustomWebSocketService {
  private isSendingPhotos: boolean = false;
  private photoQueue: TrainingImage[] = [];
  private isTakingPhotosHandlerFunction: (takePhotos: boolean) => void = () => {};
  private progressHandlerFunction: (progress: number) => void = () => {};
  private currentTrainingPlayerHandlerFunction: (playerId: string) => void = () => {};
  private trainingGroupHandlerFunction: (playerIds: string[] | null) => void = () => {};

  setWebSocketEventListeners(): void {
    this.websocketService.onMessageType(
      'training_ready_for_player',
      this.trainingReadyForPlayerEventListener
    );
    this.websocketService.onMessageType('training_progress', this.onProgressUpdate);
    this.websocketService.onMessageType('next_training_player', this.onNextTrainingPlayer);
    this.websocketService.onMessageType('group_assigned', this.onTrainingGroupAssigned);
  }

  setTakingPhotosHandlerFunction = (handler: (takePhotos: boolean) => void) => {
    this.isTakingPhotosHandlerFunction = handler;
  }

  setCurrentTrainingPlayerHandlerFunction = (handler: (playerId: string) => void) => {
    this.currentTrainingPlayerHandlerFunction = handler;
  }

  setTrainingGroupHandlerFunction = (handler: (playerIds: string[] | null) => void) => {
    this.trainingGroupHandlerFunction = handler;
  }

  onProgressUpdate = (message: WebSocketMsg) => {
    const { progress } = message.data;
    this.progressHandlerFunction(progress);
  };

  setProgressHandlerFunction(handler: (progress: number) => void) {
    this.progressHandlerFunction = handler;
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
          const startTime = Date.now();
          await this.sendTrainingPhoto(photo);
          console.log(`Photo sent in ${Date.now() - startTime} ms`);
        } catch {
          this.photoQueue.unshift(photo);
          break;
        }
      }
    }

    this.isSendingPhotos = false;
  }

  private async sendTrainingPhoto(trainingImage: TrainingImage) {
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
    this.websocketService.sendMessage({
      type: WebSocketMessageType.TRAINING_PHOTO_SENT,
      data: {
        detectedPlayer: trainingImage.detectedPlayer,
      },
    });
    console.log(response.status);
    RNFS.unlink(trainingImage.photoUri);
  }

  onNextTrainingPlayer = (message: WebSocketMsg)  => {
    const { nextPlayer } = message.data;
    this.currentTrainingPlayerHandlerFunction(nextPlayer);
  }

  onTrainingGroupAssigned = (message: WebSocketMsg)  => {
    const { groupMembers, firstPlayer } = message.data;
    console.log(groupMembers);
    this.trainingGroupHandlerFunction(groupMembers);
    this.currentTrainingPlayerHandlerFunction(firstPlayer);
  }

  readyForTraining() {
    this.websocketService.sendMessage({
      type: WebSocketMessageType.READY_FOR_TRAINING_PHASE,
    });
  }
  close(): void {
    this.websocketService.offMessageType('training_ready_for_player');
  }
}
