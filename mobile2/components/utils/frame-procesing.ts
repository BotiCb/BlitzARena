import {Frame} from 'react-native-vision-camera';
import { Keypoint, Pose } from './types';
import { worklet } from 'react-native-worklets-core';



  export function mapToPose(flatData: any): Pose {
    'worklet';
    const keypoints: Keypoint[] = [];
  
    // Check if the input has exactly 51 elements (17 keypoints * 3 values each)
    if (flatData.length !== 51) {
      throw new Error("Input data should contain exactly 51 values.");
    }
  
    for (let i = 0; i < flatData.length; i += 3) {
      const keypoint: Keypoint = {
        y: flatData[i],         // Y coordinate
        x: flatData[i + 1],     // X coordinate
        score: flatData[i + 2]  // Confidence score
      };
      keypoints.push(keypoint);
    }
  
    return { keypoints };
  }