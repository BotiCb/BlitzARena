import { Camera } from "react-native-vision-camera";
import { ObjectDetection } from "../utils/types";
import { ImageCropData } from "@react-native-community/image-editor/lib/typescript/src/types";
import { ISharedValue } from "react-native-worklets-core";
import ImageEditor from "@react-native-community/image-editor";
import RNFS from "react-native-fs";
import { TrainingImage } from "../websocket/utils/types";

export async function takeCroppedTrainingImage(
  camera: Camera,
  detections: ISharedValue<ObjectDetection | null>,
  lastUpdateTime: ISharedValue<number>,
  playerNumber: number,
  takePhotos: boolean,
) : Promise<TrainingImage | null> {
  while (Date.now() - lastUpdateTime.value > 10) {
    await new Promise(resolve => setTimeout(resolve, 3));
    if (!detections.value || !takePhotos) {
      console.log("Skipping photo");
      return null;
    }
  }

  const photoPromise = camera.takePhoto();
  console.log(Date.now() - lastUpdateTime.value);
  const photo = await photoPromise;
  if (photo && detections.value) {
    console.log(photo.width, photo.height);
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
    const croppedPhoto = await ImageEditor.cropImage("file://" + photo.path, cropOptions);

    const base64Image = await RNFS.readFile(croppedPhoto.uri, "base64");
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
