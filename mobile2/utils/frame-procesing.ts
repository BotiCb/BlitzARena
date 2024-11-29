import { Frame } from "react-native-vision-camera";
import { Keypoint, Pose } from "./types";
import { worklet } from "react-native-worklets-core";

import { MOVENET_CONSTANTS } from "@/constants/MovenetConstants";

export function mapToPose(flatData: any): Pose {
  "worklet";
  const keypoints: Keypoint[] = [];

  // Check if the input has exactly 51 elements (17 keypoints * 3 values each)

  for (let i = 0; i < flatData.length; i += 3) {
    if (flatData[i + 2] < MOVENET_CONSTANTS.TRESHOLD) {
      continue;
    }
    const keypoint: Keypoint = {
      y: flatData[i], // Y coordinate
      x: flatData[i + 1], // X coordinate
      score: flatData[i + 2],
      name: MOVENET_CONSTANTS.KEYPONTS[i / 3],
      index: i, // Confidence score
    };
    keypoints.push(keypoint);
  }

  return { keypoints };
}

// Keypoint names (you can expand or adjust these based on your model)
const keypointNames = [
  "nose",
  "leftEye",
  "rightEye",
  "leftEar",
  "rightEar",
  "leftShoulder",
  "rightShoulder",
  "leftElbow",
  "rightElbow",
  "leftWrist",
  "rightWrist",
  "leftHip",
  "rightHip",
  "leftKnee",
  "rightKnee",
  "leftAnkle",
  "rightAnkle",
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
export function mapToKeypoints(heatmapData: any, offsetData: any): Keypoint[] {
  "worklet";
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
    const offsetY =
      offsetData[i * 2 * GRID_SIZE * GRID_SIZE + maxY * GRID_SIZE + maxX];
    const offsetX =
      offsetData[i * 2 * GRID_SIZE * GRID_SIZE + maxY * GRID_SIZE + maxX + 1];

    // Calculate actual position in the input image
    const y = (maxY + offsetY) * (INPUT_IMAGE_SIZE / GRID_SIZE);
    const x = (maxX + offsetX) * (INPUT_IMAGE_SIZE / GRID_SIZE);

    // Create a Keypoint object and add it to the list
    const keypoint: Keypoint = {
      y,
      x,
      score: maxScore,
      index: i,
      name: keypointName,
    };
    if (keypoint.score < MOVENET_CONSTANTS.TRESHOLD) {
      continue;
    }
    keypoints.push(keypoint);
  }

  return keypoints;
}

type Detection = {
  boundingBox: { xMin: number; yMin: number; xMax: number; yMax: number };
  confidence: number;
  classScore: number;
  keypoints: Array<{ x: number; y: number; confidence: number }>;
};

/**
 * Applies Non-Maximum Suppression (NMS) to filter overlapping detections.
 */

function computeIoU(
  boxA: { xMin: number; yMin: number; xMax: number; yMax: number },
  boxB: { xMin: number; yMin: number; xMax: number; yMax: number }
): number {
  "worklet";
  const x1 = Math.max(boxA.xMin, boxB.xMin);
  const y1 = Math.max(boxA.yMin, boxB.yMin);
  const x2 = Math.min(boxA.xMax, boxB.xMax);
  const y2 = Math.min(boxA.yMax, boxB.yMax);

  const intersectionArea = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const boxAArea = (boxA.xMax - boxA.xMin) * (boxA.yMax - boxA.yMin);
  const boxBArea = (boxB.xMax - boxB.xMin) * (boxB.yMax - boxB.yMin);

  const unionArea = boxAArea + boxBArea - intersectionArea;
  return unionArea === 0 ? 0 : intersectionArea / unionArea;
}
function applyNMS(detections: Detection[], iouThreshold: number): Detection[] {
  "worklet";
  const selected: Detection[] = [];

  // Sort detections by confidence score (descending)
  detections.sort((a, b) => b.confidence - a.confidence);

  while (detections.length > 0) {
    const best = detections.shift()!; // Highest-confidence detection
    selected.push(best);

    detections = detections.filter((detection) => {
      const iou = computeIoU(best.boundingBox, detection.boundingBox);
      return iou < iouThreshold; // Keep detections with low overlap
    });
  }

  return selected;
}

/**
 * Computes Intersection over Union (IoU) between two bounding boxes.
 */

/**
 * Maps model output to structured detections and applies NMS.
 */
export function mapModelOutputWithNMS(
  output: any,
  detectionThreshold = 0.5,
  iouThreshold = 0.5
): Detection[] {
  "worklet";
  const numAttributes = 56; // Each detection has 56 values
  const numKeypoints = 17;
  const keypointsPerDetection = numKeypoints * 3;

  const detections: Detection[] = [];

  const totalDetections = output.length / numAttributes;

  for (let i = 0; i < totalDetections; i++) {
    const startIdx = i * numAttributes;

    // Extract bounding box
    const xMin = output[startIdx];
    const yMin = output[startIdx + 1];
    const xMax = output[startIdx + 2];
    const yMax = output[startIdx + 3];

    // Extract confidence and class score
    const confidence = output[startIdx + 4];
    const classScore = output[startIdx + 5];

    // Skip detections below the confidence threshold
    if (confidence < detectionThreshold) continue;

    // Extract keypoints
    const keypoints: Array<{ x: number; y: number; confidence: number }> = [];
    for (let kp = 0; kp < numKeypoints; kp++) {
      const kpOffset = startIdx + 6 + kp * 3;
      const x = output[kpOffset];
      const y = output[kpOffset + 1];
      const kpConfidence = output[kpOffset + 2];
      keypoints.push({ x, y, confidence: kpConfidence });
    }

    // Add detection to the list
    detections.push({
      boundingBox: { xMin, yMin, xMax, yMax },
      confidence,
      classScore,
      keypoints,
    });
  }

  // Apply Non-Maximum Suppression
  return applyNMS(detections, iouThreshold);
}
function sigmoid(x: number): number {
  "worklet";
  return 1 / (1 + Math.exp(-x));
}

export function decodeYoloOutput(
  outputTensor: any[],
  numDetections: number,
  attributes = 5
) {
  "worklet";
  const detections = [];
  for (let i = 0; i < numDetections; i++) {
    const confidence = outputTensor[0][i + numDetections * 4];
    if(confidence < 0.5){
      continue;
    }
      const xc = outputTensor[0][i];
      const yc = outputTensor[0][i + numDetections];
      const w = outputTensor[0][i + numDetections * 2];
      const h = outputTensor[0][i + numDetections * 3];
      detections.push({
        xc,
        yc,
        w,
        h,
        confidence,
        
      });
     
  }
  return detections;
}

export function nonMaxSuppressionFromYolo(
  detections: any[],
  iouThreshold: number
) {
  "worklet";
  // Compute IoU between two boxes
  function iou(boxA: any, boxB: any) {
    const xa = Math.max(boxA.x, boxB.x);
    const ya = Math.max(boxA.y, boxB.y);
    const xb = Math.min(boxA.x + boxA.width, boxB.x + boxB.width);
    const yb = Math.min(boxA.y + boxA.height, boxB.y + boxB.height);

    const interArea = Math.max(0, xb - xa) * Math.max(0, yb - ya);
    const boxAArea = boxA.width * boxA.height;
    const boxBArea = boxB.width * boxB.height;

    return interArea / (boxAArea + boxBArea - interArea);
  }

  // Sort detections by confidence
  detections.sort((a, b) => b.confidence - a.confidence);

  const selected = [];
  while (detections.length > 0) {
    const current = detections.shift(); // Take the detection with the highest confidence
    selected.push(current);

    // Filter out overlapping detections
    detections = detections.filter(
      (detection) => iou(current, detection) <= iouThreshold
    );
  }

  return selected; // Filtered detections
}
