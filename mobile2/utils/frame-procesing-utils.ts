import { DrawableFrame, Frame } from "react-native-vision-camera";
import { BoundingBox, Detection, Keypoint } from "./types";

import { MOVENET_CONSTANTS } from "@/constants/MovenetConstants";
import { Skia, SkPaint } from "@shopify/react-native-skia/lib/typescript/src/skia/types";
import { worklet } from "react-native-worklets-core";

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

function sigmoid(x: number): number {
  "worklet";
  return 1 / (1 + Math.exp(-x));
}

export function nonMaximumSuppression(
  detections: Detection[],
  iouThreshold = 0.5
): Detection[] {
  "worklet";

  // Helper function to calculate IoU
  function calculateIoU(boxA: BoundingBox, boxB: BoundingBox): number {
    "worklet";
    // Ensure correct min/max handling of flipped y-coordinates
    const x1 = Math.max(boxA.x1, boxB.x1);
    const y1 = Math.min(boxA.y1, boxB.y1); // Use min because y is flipped
    const x2 = Math.min(boxA.x2, boxB.x2);
    const y2 = Math.max(boxA.y2, boxB.y2); // Use max because y is flipped

    // Compute intersection area
    const intersection = Math.max(0, x2 - x1) * Math.max(0, y1 - y2);

    // Compute areas of both boxes
    const boxAArea = (boxA.x2 - boxA.x1) * (boxA.y1 - boxA.y2); // y1 - y2 because of flip
    const boxBArea = (boxB.x2 - boxB.x1) * (boxB.y1 - boxB.y2);

    // Union area
    const union = boxAArea + boxBArea - intersection;

    return union === 0 ? 0 : intersection / union; // Avoid division by zero
  }

  // Sort detections by confidence in descending order
  detections.sort((a, b) => b.confidence - a.confidence);

  const finalDetections: Detection[] = [];

  while (detections.length > 0) {
    const current = detections.shift()!; // Highest confidence detection
    finalDetections.push(current);

    // Filter out detections with IoU >= threshold
    detections = detections.filter(
      (det) => calculateIoU(current.boundingBox, det.boundingBox) < iouThreshold
    );
  }

  return finalDetections;
}

export function decodeYoloOutput(
  outputTensor: any[],
  numDetections: number,
  attributes = 5
): Detection[] {
  "worklet";
  const detections: Detection[] = [];
  
  for (let i = 0; i < numDetections; i++) {
    const confidence = outputTensor[0][i + numDetections * 4];
    if (confidence < 0.5) {
      continue;
    }
    const xc = outputTensor[0][i];
    const yc = outputTensor[0][i + numDetections];
    const w = outputTensor[0][i + numDetections * 2];
    const h = outputTensor[0][i + numDetections * 3];

    const y1 = 1-(xc - w / 2); // Top-left y
    const x1 = yc - h / 2; // Top-left x
    const y2 = 1-(xc + w / 2); // Bottom-right y
    const x2 = yc + h / 2; // Bottom-right x

    const keypoints: Keypoint[] = [];
    for (let j = 5; j < 56; j += 3) {
      const y = outputTensor[0][j * numDetections + i];
      const x = outputTensor[0][j * numDetections + i + 1];
      const confidence = outputTensor[0][j * numDetections + i + 2];
      const keypointName = MOVENET_CONSTANTS.KEYPONTS[(j - 5) / 3];
      if (confidence < 0.5) {
        continue; // Skip low-confidence keypoints
      }
      keypoints.push({
        x,
        y,
        confidence,
        name: keypointName,
      });
    }

    detections.push({
      boundingBox: {
        x1,
        y1,
        x2,
        y2,
      },
      confidence,
      keypoints,
    });
  }

  // Apply NMS after decoding all detections
  return nonMaximumSuppression(detections, 0.5);
}



export function drawDetections(frame: DrawableFrame, detections: Detection[], paint: SkPaint) {
  "worklet";
  for (const detection of detections) {
    frame.drawLine(
      detection.boundingBox.x1 * frame.width, // Corrected width scaling
      detection.boundingBox.y1 * frame.height, // Corrected height scaling
      detection.boundingBox.x2 * frame.width,
      detection.boundingBox.y1 * frame.height,
      paint
    );
    frame.drawLine(
      detection.boundingBox.x2 * frame.width,
      detection.boundingBox.y1 * frame.height,
      detection.boundingBox.x2 * frame.width,
      detection.boundingBox.y2 * frame.height,
      paint
    );
    frame.drawLine(
      detection.boundingBox.x2 * frame.width,
      detection.boundingBox.y2 * frame.height,
      detection.boundingBox.x1 * frame.width,
      detection.boundingBox.y2 * frame.height,
      paint
    );
    frame.drawLine(
      detection.boundingBox.x1 * frame.width,
      detection.boundingBox.y2 * frame.height,
      detection.boundingBox.x1 * frame.width,
      detection.boundingBox.y1 * frame.height,
      paint
    );
  }
}