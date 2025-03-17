import RNFS from 'react-native-fs';

import { AbstractCustomWebSocketService } from './custom-websocket.abstract-service';
import { TrainingImage, WebSocketMessageType, WebSocketMsg } from './websocket-types';
import { MODEL_TRAINING_ENDPOINTS } from '../restApi/Endpoints';
import { apiClient } from '../restApi/RestApiService';

import { TrainingPhase } from '~/utils/types/types';
import { TRAINING_CAMERA_CONSTANTS } from '~/utils/constants/frame-processing-constans';

export class ModelTrainingWebSocketService extends AbstractCustomWebSocketService {
  private remainingPhotoToSendCount: number = 0;
  private isTakingPhotosHandlerFunction: (takePhotos: boolean) => void = () => { };
  private photoCollectingProgressHandlerFunction: (progress: number) => void = () => { };
  private currentTrainingPlayerHandlerFunction: (playerId: string) => void = () => { };
  private trainingGroupHandlerFunction: (playerIds: string[] | null) => void = () => { };
  private phaseHandlerFunction: (phase: TrainingPhase) => void = () => { };
  private takePhotoFunction: () => Promise<string> = () => Promise.resolve('');
  private isTakePhotos: boolean = false;
  private currentTrainingPlayer: string | null = null;

  setWebSocketEventListeners(): void {
    this.websocketService.onMessageType(
      'training_ready_for_player',
      this.trainingReadyForPlayerEventListener
    );
    this.websocketService.onMessageType(
      'photo_collecting_progress',
      this.onPhotoCollectingProgressUpdate
    );
    this.websocketService.onMessageType('next_training_player', this.onNextTrainingPlayer);
    this.websocketService.onMessageType('model_training_phase_info', this.onModelTrainingPhaseInfo);
    this.websocketService.onMessageType(
      'training_finished_for_group',
      this.onTrainingFinishedForGroup
    );
  }

  setPhaseHandlerFunction = (handler: (phase: TrainingPhase) => void) => {
    this.phaseHandlerFunction = handler;
  };

  setIsTakingPhotosHandlerFunction = (handler: (takePhotos: boolean) => void) => {
    this.isTakingPhotosHandlerFunction = handler;
  };

  setIsTakeingPhotos = (isTakePhotos: boolean) => {
    this.isTakePhotos = isTakePhotos;
  }


  setTakePhotoFunction = (handler: () => Promise<string>) => {
    this.takePhotoFunction = handler;
  }

  setCurrentTrainingPlayerHandlerFunction = (handler: (playerId: string) => void) => {
    this.currentTrainingPlayerHandlerFunction = handler;
  };

  setTrainingGroupHandlerFunction = (handler: (playerIds: string[] | null) => void) => {
    this.trainingGroupHandlerFunction = handler;
  };

  onPhotoCollectingProgressUpdate = (message: WebSocketMsg) => {
    const { progress } = message.data;
    this.photoCollectingProgressHandlerFunction(progress);
  };

  setProgressHandlerFunction(handler: (progress: number) => void) {
    this.photoCollectingProgressHandlerFunction = handler;
  }

  trainingReadyForPlayerEventListener = () => {
    this.isTakingPhotosHandlerFunction(false);
  };

  private photosInparalelCount: number = 0;

  private photoQueue: TrainingImage[] = [];
  private isUploading = false;
  private maxConcurrentCaptures = 3; // Limit to avoid overloading the device

  takePhotos = async (): Promise<void> => {
    if (this.remainingPhotoToSendCount <= 0) {
      this.isTakingPhotosHandlerFunction(false);
      return;
    }

    const takePhotoLoop = async () => {
      const capturePromises: Promise<void>[] = [];

      while (this.remainingPhotoToSendCount > 0 && this.isTakePhotos) {
        if (capturePromises.length < this.maxConcurrentCaptures) {
          console.log('Capturing photo, remaining:', this.remainingPhotoToSendCount, capturePromises.length, this.photoQueue.length);
          const capturePromise = this.captureAndQueuePhoto();
          capturePromises.push(capturePromise);
          capturePromise.finally(() => {
            const index = capturePromises.indexOf(capturePromise);
            if (index !== -1) capturePromises.splice(index, 1);
          });
        }

        await new Promise(resolve => setTimeout(resolve, 300));
      }

      await Promise.all(capturePromises); 
      this.isTakingPhotosHandlerFunction(false);
    };

    takePhotoLoop();
  };

  private async captureAndQueuePhoto() {
    try {
      const photoUri = await this.takePhotoFunction();
      if (this.currentTrainingPlayer === null) {
        throw new Error('No current training player');
      }
      const trainingImage: TrainingImage = {
        photoUri,
        detectedPlayer: this.currentTrainingPlayer,
        photoSize: TRAINING_CAMERA_CONSTANTS.OUTPUT_IMAGE_SIZE
      }
      this.photoQueue.push(trainingImage); 
      this.remainingPhotoToSendCount--;

      if (!this.isUploading) {
        this.processPhotoQueue();
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
    }
  }

  private async processPhotoQueue() {
    this.isUploading = true;

    while (this.photoQueue.length > 0) {
      const trainingImage = this.photoQueue.shift(); // Take first photo in queue
      if (trainingImage) {
        await this.sendTrainingPhoto(trainingImage);
      }
    }

    this.isUploading = false;
  }

  private async sendTrainingPhoto(trainingImage: TrainingImage) {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: trainingImage.photoUri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      } as any);

      formData.append('playerId', trainingImage.detectedPlayer);
      formData.append('photoSize', trainingImage.photoSize.toString());

      await apiClient.post(
        MODEL_TRAINING_ENDPOINTS.UPLOAD_PHOTO(ModelTrainingWebSocketService.gameId),
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      this.websocketService.sendMessage({
        type: WebSocketMessageType.TRAINING_PHOTO_SENT,
        data: { detectedPlayer: trainingImage.detectedPlayer },
      });

    } catch (error) {
      console.error('Error uploading photo:', error);
      this.remainingPhotoToSendCount++;
    }
    finally{
      await RNFS.unlink(trainingImage.photoUri);
    }
  }

  onNextTrainingPlayer = (message: WebSocketMsg) => {
    const { nextPlayer, photosToCollect } = message.data;
    this.remainingPhotoToSendCount = photosToCollect;
    this.currentTrainingPlayerHandlerFunction(nextPlayer);
    this.currentTrainingPlayer = nextPlayer;
    if (ModelTrainingWebSocketService.sessionId === nextPlayer) {
      this.phaseHandlerFunction('photos-from-you');
    } else {
      this.phaseHandlerFunction('take-photos');
    }
    this.photoQueue = [];
  };

  onModelTrainingPhaseInfo = (message: WebSocketMsg) => {
    const { groupMembers, currentPlayer, photosToCollect, photoCollectingProgress } = message.data;
    this.remainingPhotoToSendCount = photosToCollect;
    this.trainingGroupHandlerFunction(groupMembers);
    this.currentTrainingPlayerHandlerFunction(currentPlayer);
    this.currentTrainingPlayer = currentPlayer;
    if (ModelTrainingWebSocketService.sessionId === currentPlayer) {
      this.phaseHandlerFunction('photos-from-you');
    } else {
      this.phaseHandlerFunction('take-photos');
    }
    this.photoCollectingProgressHandlerFunction(photoCollectingProgress);

    AbstractCustomWebSocketService.isPhaseInfosNeededHandlerFunction(false);
  };

  onTrainingFinishedForGroup = (message: WebSocketMsg) => {
    this.phaseHandlerFunction('training-ready-for-group');
  };
  close(): void {
    this.websocketService.offMessageType('training_ready_for_player');
  }
}
