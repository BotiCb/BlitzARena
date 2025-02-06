import ImageEditor from '@react-native-community/image-editor';
import { ImageCropData } from '@react-native-community/image-editor/lib/typescript/src/types';
import RNFS from 'react-native-fs';
import { Camera } from 'react-native-vision-camera';
import { ISharedValue } from 'react-native-worklets-core';
import { ObjectDetection } from '~/utils/types';
import { TrainingImage } from '../websocket/websocket-types';
import { TRAINING_CAMERA_CONSTANTS } from '~/utils/constants/frame-processing-constans';



export async function takeCroppedTrainingImage(
  camera: Camera,
  detections: ISharedValue<ObjectDetection | null>,
  lastUpdateTime: ISharedValue<number>,
  playerNumber: number,
  takePhotos: boolean
): Promise<TrainingImage | null> {
  while (Date.now() - lastUpdateTime.value > TRAINING_CAMERA_CONSTANTS.MAX_TAKE_PHOTO_TIME_DELTA) {
    await new Promise((resolve) => setTimeout(resolve, TRAINING_CAMERA_CONSTANTS.TAKE_PHOTO_DELAY));
    if (!detections.value || !takePhotos) {
      console.log('Skipping photo');
      return null;
    }
  }

  const photoPromise = camera.takePhoto();
  console.log(Date.now() - lastUpdateTime.value);
  const photo = await photoPromise;
  if (photo && detections.value) {
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

    const base64Image = await RNFS.readFile(croppedPhoto.uri, 'base64');
    //delete the photo file after using it
    await RNFS.unlink(croppedPhoto.uri);
    await RNFS.unlink(photo.path);
    const trainingImage: TrainingImage = {
      photo: base64Image,
      detectedPlayer: playerNumber.toString(),
    };

    return trainingImage;
  }

  return null;
}
