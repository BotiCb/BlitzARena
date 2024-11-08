
import { decodeJpeg } from '@tensorflow/tfjs-react-native';
import * as tf from '@tensorflow/tfjs';
import * as jpeg from 'jpeg-js';
import { CameraCapturedPicture } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator'
import { CameraConstants } from './cameraConstants';


  export async function imageToTensor3D(photo : CameraCapturedPicture): Promise<tf.Tensor3D> {
    try{
      const resizedPhoto = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: CameraConstants.INPUT_WIDTH, height: CameraConstants.INPUT_HEIGHT } }], // resize to width of 300 and preserve aspect ratio 
       );
      const response = await fetch(resizedPhoto.uri); 
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsArrayBuffer(blob);
  
      return new Promise((resolve, reject) => {
        reader.onloadend = () => {
          const rawImageData = reader.result as ArrayBuffer;
          const { width, height, data } = jpeg.decode(rawImageData, { useTArray: true });
          const buffer = new Uint8Array(width * height * 3); 
  
          let offset = 0; 
          for (let i = 0; i < width * height; i++) {
            buffer[offset] = data[i * 4]; 
            buffer[offset + 1] = data[i * 4 + 1]; 
            buffer[offset + 2] = data[i * 4 + 2]; 
            offset += 3;
          }
  
          const tensor = tf.tensor3d(buffer, [height, width, 3]);
          resolve(tensor);
        };
        reader.onerror = reject;
      });}
    catch(error){
      console.error("Error converting image to tensor", error);
      throw error;
    }
    
  }


  export function mapBodyPixPartIdToName(partId: number): string {
    switch (partId) {
      case 0: return "Left Face";
      case 1: return "Right Face";
      case 2: return "Left Upper Arm Front";
      case 3: return "Left Upper Arm Back";
      case 4: return "Right Upper Arm Front";
      case 5: return "Right Upper Arm Back";
      case 6: return "Left Lower Arm Front";
      case 7: return "Left Lower Arm Back";
      case 8: return "Right Lower Arm Front";
      case 9: return "Right Lower Arm Back";
      case 10: return "Left Hand";
      case 11: return "Right Hand";
      case 12: return "Torso Front";
      case 13: return "Torso Back";
      case 14: return "Left Upper Leg Front";
      case 15: return "Left Upper Leg Back";
      case 16: return "Right Upper Leg Front";
      case 17: return "Right Upper Leg Back";
      case 18: return "Left Lower Leg Front";
      case 19: return "Left Lower Leg Back";
      case 20: return "Right Lower Leg Front";
      case 21: return "Right Lower Leg Back";
      case 22: return "Left Feet";
      case 23: return "Right Feet";
      default: return "Unknown"; // Or handle the default case as needed
    }
  }