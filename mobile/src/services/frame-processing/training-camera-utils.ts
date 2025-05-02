import ImageEditor from '@react-native-community/image-editor';
import { ImageCropData } from '@react-native-community/image-editor/lib/typescript/src/types';
import { Camera } from 'react-native-vision-camera';
import { ISharedValue } from 'react-native-worklets-core';

import { ObjectDetection } from '~/utils/types/detection-types';
import ImageResizer from 'react-native-image-resizer';
import RNFS from 'react-native-fs';

export async function takeCroppedTrainingImage(
  camera: Camera,
  detections: ISharedValue<ObjectDetection | null>,
  lastUpdateTime: ISharedValue<number>
): Promise<string> {
  let maxTryCount = 3;

  const photoPromise = camera.takeSnapshot();
  const photo = await photoPromise;
  if (!photo) {
    throw new Error('No photo taken');
  }

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

  const resizedImage = await ImageResizer.createResizedImage(
    croppedPhoto.uri, // string path
    256,
    256,
    'JPEG',
    95,
    0,
    undefined,
    false, // mode: don't keep metadata
    { mode: 'stretch' }
  );

  RNFS.unlink(croppedPhoto.uri)
  RNFS.unlink(photo.path)

  return resizedImage.uri;
}
