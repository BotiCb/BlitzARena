import {Frame} from 'react-native-vision-camera';
import { Keypoint, Pose } from './types';
import { worklet } from 'react-native-worklets-core';

import { MOVENET_CONSTANTS } from '@/constants/MovenetConstants';


  export function mapToPose(flatData: any): Pose {
    'worklet';
    const keypoints: Keypoint[] = [];
  
    // Check if the input has exactly 51 elements (17 keypoints * 3 values each)
    
  
    for (let i = 0; i < flatData.length; i += 3) {
      if(flatData[i+2]< MOVENET_CONSTANTS.TRESHOLD){
        continue;
      }
      const keypoint: Keypoint = {
        y: flatData[i],         // Y coordinate
        x: flatData[i + 1],     // X coordinate
        score: flatData[i + 2],
        name : MOVENET_CONSTANTS.KEYPONTS[i/3],
        index: i  // Confidence score
      };
      keypoints.push(keypoint);
    }
  
    return { keypoints };
  }

  
  
  // Keypoint names (you can expand or adjust these based on your model)
  const keypointNames = [
    "nose", "leftEye", "rightEye", "leftEar", "rightEar",
    "leftShoulder", "rightShoulder", "leftElbow", "rightElbow",
    "leftWrist", "rightWrist", "leftHip", "rightHip",
    "leftKnee", "rightKnee", "leftAnkle", "rightAnkle"
  ];
  
  // Assume 9x9 heatmap grid and model input size of 257x257 pixels
  const GRID_SIZE = 9;
  const INPUT_IMAGE_SIZE = 192;
  
  /**
   * Maps raw flat data to Keypoints.
   * @param heatmapData - Flat array with heatmap data for each keypoint.
   * @param offsetData - Flat array with offset data for each keypoint.
   * @returns Array of Keypoint objects.
   */
  export function mapToKeypoints(
    heatmapData: any,
    offsetData: any
  ): Keypoint[] {
    'worklet';
    const keypoints: Keypoint[] = [];
  
    for (let i = 0; i < keypointNames.length; i++) {
      const keypointName = keypointNames[i];
  
      // Find max score in the 9x9 heatmap for each keypoint
      let maxScore = -Infinity;
      let maxIndex = 0;
      for (let j = 0; j < GRID_SIZE * GRID_SIZE; j++) {
        const score = heatmapData[i * GRID_SIZE * GRID_SIZE + j];
        if (score > maxScore) {
          maxScore = score;
          maxIndex = j;
        }
      }
  
      // Calculate grid coordinates (y, x) from max index
      const maxY = Math.floor(maxIndex / GRID_SIZE);
      const maxX = maxIndex % GRID_SIZE;
  
      // Retrieve offset values for more precise location within the grid cell
      const offsetY = offsetData[i * 2 * GRID_SIZE * GRID_SIZE + maxY * GRID_SIZE + maxX];
      const offsetX = offsetData[i * 2 * GRID_SIZE * GRID_SIZE + maxY * GRID_SIZE + maxX + 1];
  
      // Calculate actual position in the input image
      const y = (maxY + offsetY) * (INPUT_IMAGE_SIZE / GRID_SIZE);
      const x = (maxX + offsetX) * (INPUT_IMAGE_SIZE / GRID_SIZE);
  
      // Create a Keypoint object and add it to the list
      const keypoint: Keypoint = {
        y,
        x,
        score: maxScore,
        index: i,
        name: keypointName
      };
      if(keypoint.score < MOVENET_CONSTANTS.TRESHOLD){
        continue;
      }
      keypoints.push(keypoint);
    }
  
    return keypoints;
  }
  
  export function mapModelOutputToKeypoints(flatData: any): Keypoint[] {
    'worklet';
    const keypoints: Keypoint[] = [];
  
    for (let i = 0; i < 17; i++) {
      const y = flatData[i * 3];
      const x = flatData[i * 3 + 1];
      const score = flatData[i * 3 + 2];
  
      keypoints.push({
        y,
        x,
        score,
        index: i,
        name: MOVENET_CONSTANTS.KEYPONTS[i]
      });
    }
  
    return keypoints;
  }