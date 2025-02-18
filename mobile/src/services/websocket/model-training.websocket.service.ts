import RNFS from 'react-native-fs';

import { AbstractCustomWebSocketService } from './custom-websocket.abstract-service';
import { TrainingImage, WebSocketMessageType, WebSocketMsg } from './websocket-types';
import { MODEL_TRAINING_ENDPOINTS } from '../restApi/Endpoints';
import { apiClient } from '../restApi/RestApiService';

import { TrainingPhase } from '~/utils/types';

export class ModelTrainingWebSocketService extends AbstractCustomWebSocketService {
  private remainingPhotoToSendCount: number = 0;
  private isTakingPhotosHandlerFunction: (takePhotos: boolean) => void = () => {};
  private progressHandlerFunction: (progress: number) => void = () => {};
  private currentTrainingPlayerHandlerFunction: (playerId: string) => void = () => {};
  private trainingGroupHandlerFunction: (playerIds: string[] | null) => void = () => {};
  private phaseHandlerFunction: (phase: TrainingPhase) => void = () => {};

  setWebSocketEventListeners(): void {
    this.websocketService.onMessageType(
      'training_ready_for_player',
      this.trainingReadyForPlayerEventListener
    );
    this.websocketService.onMessageType('training_progress', this.onProgressUpdate);
    this.websocketService.onMessageType('next_training_player', this.onNextTrainingPlayer);
    this.websocketService.onMessageType('group_assigned', this.onTrainingGroupAssigned);
    this.websocketService.onMessageType(
      'training_finished_for_group',
      this.onTrainingFinishedForGroup
    );
  }

  setPhaseHandlerFunction = (handler: (phase: TrainingPhase) => void) => {
    this.phaseHandlerFunction = handler;
  };

  setTakingPhotosHandlerFunction = (handler: (takePhotos: boolean) => void) => {
    this.isTakingPhotosHandlerFunction = handler;
  };

  setCurrentTrainingPlayerHandlerFunction = (handler: (playerId: string) => void) => {
    this.currentTrainingPlayerHandlerFunction = handler;
  };

  setTrainingGroupHandlerFunction = (handler: (playerIds: string[] | null) => void) => {
    this.trainingGroupHandlerFunction = handler;
  };

  onProgressUpdate = (message: WebSocketMsg) => {
    const { progress } = message.data;
    this.progressHandlerFunction(progress);
  };

  setProgressHandlerFunction(handler: (progress: number) => void) {
    this.progressHandlerFunction = handler;
  }

  trainingReadyForPlayerEventListener = () => {
    this.isTakingPhotosHandlerFunction(false);
  };

  takePhoto = async (trainingImage: TrainingImage): Promise<void> => {
    if (this.remainingPhotoToSendCount <= 0) {
      this.isTakingPhotosHandlerFunction(false);
      return;
    }

    try {
      await this.sendTrainingPhoto(trainingImage);
      this.remainingPhotoToSendCount--;

      if (this.remainingPhotoToSendCount <= 0) {
        this.isTakingPhotosHandlerFunction(false);
      }

      this.websocketService.sendMessage({
        type: WebSocketMessageType.TRAINING_PHOTO_SENT,
        data: { detectedPlayer: trainingImage.detectedPlayer },
      });
    } catch (error) {
      console.error('Error processing photo:', error);
    }
  };

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

    const response = await apiClient.post(MODEL_TRAINING_ENDPOINTS.UPLOAD_PHOTO, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log(response.data);
    RNFS.unlink(trainingImage.photoUri); // Clean up the file after sending
  }

  onNextTrainingPlayer = (message: WebSocketMsg) => {
    const { nextPlayer, photosToCollect } = message.data;
    this.remainingPhotoToSendCount = photosToCollect;
    this.currentTrainingPlayerHandlerFunction(nextPlayer);
    if (ModelTrainingWebSocketService.sessionId === nextPlayer) {
      this.phaseHandlerFunction('photos-from-you');
    } else {
      this.phaseHandlerFunction('take-photos');
    }
  };

  onTrainingGroupAssigned = (message: WebSocketMsg) => {
    const { groupMembers, firstPlayer, photosToCollect } = message.data;
    console.log(groupMembers, photosToCollect);
    this.remainingPhotoToSendCount = photosToCollect;
    this.trainingGroupHandlerFunction(groupMembers);
    this.currentTrainingPlayerHandlerFunction(firstPlayer);
    if (ModelTrainingWebSocketService.sessionId === firstPlayer) {
      this.phaseHandlerFunction('photos-from-you');
    } else {
      this.phaseHandlerFunction('take-photos');
    }
  };

  readyForTraining() {
    this.websocketService.sendMessage({
      type: WebSocketMessageType.READY_FOR_TRAINING_PHASE,
    });
  }

  onTrainingFinishedForGroup = (message: WebSocketMsg) => {
    this.phaseHandlerFunction('training-ready-for-group');
  };
  close(): void {
    this.websocketService.offMessageType('training_ready_for_player');
  }
}
