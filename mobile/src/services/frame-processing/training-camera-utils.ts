import ImageEditor from '@react-native-community/image-editor';
import { ImageCropData } from '@react-native-community/image-editor/lib/typescript/src/types';
import React from 'react';
import { Camera } from 'react-native-vision-camera';
import { ISharedValue } from 'react-native-worklets-core';

import { TrainingImage } from '../websocket/websocket-types';

import { TRAINING_CAMERA_CONSTANTS } from '~/utils/constants/frame-processing-constans';
import { ObjectDetection } from '~/utils/types/detection-types';

export async function takeCroppedTrainingImage(
  camera: Camera,
  detections: ISharedValue<ObjectDetection | null>,
  lastUpdateTime: ISharedValue<number>,
  playerId: string,
  imageSize: number
): Promise<TrainingImage> {
  let maxTryCount = 3;
  // while (Date.now() - lastUpdateTime.value > TRAINING_CAMERA_CONSTANTS.MAX_TAKE_PHOTO_TIME_DELTA) {
  //   await new Promise((resolve) => setTimeout(resolve, TRAINING_CAMERA_CONSTANTS.TAKE_PHOTO_DELAY));
  //   console.warn('Waiting for next photo frame...' + maxTryCount);
  //   if (!detections.value || camera === null || !maxTryCount) {
  //     console.log('No detections or camera');
  //     throw new Error('No detections or camera');
  //   }
  //   maxTryCount--;
  // }
  const photoPromise = camera.takeSnapshot();
  const photo = await photoPromise;
  if(!photo) {
    throw new Error('No photo taken');
  };

  if (!detections.value) {
    throw new Error('No detections');
  }
  let cropOptions: ImageCropData;
  if (photo.height > photo.width) {
    cropOptions = {
      offset: {
        x: (1 - detections.value.boundingBox.y1) * photo.width,
        y: detections.value.boundingBox.x1 * photo.height,
      },
      size: {
        width: detections.value.boundingBox.w * photo.width,
        height: detections.value.boundingBox.h * photo.height,
      },
      quality: 1.0,
    };
  } else {
    cropOptions = {
      offset: {
        x: (1 - detections.value.boundingBox.y1) * photo.height,
        y: detections.value.boundingBox.x1 * photo.width,
      },
      size: {
        width: detections.value.boundingBox.w * photo.height,
        height: detections.value.boundingBox.h * photo.width,
      },
      quality: 1.0,
    };
  }
  const croppedPhoto = await ImageEditor.cropImage('file://' + photo.path, cropOptions);

  const trainingImage: TrainingImage = {
    photoUri: croppedPhoto.uri,
    detectedPlayer: playerId,
    photoSize: imageSize,
  };
  return trainingImage;
}
