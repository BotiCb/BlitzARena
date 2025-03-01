import { YOLO_POSE_CONSTANTS } from '~/utils/constants/detection-constants';
import { ObjectDetection, BoundingBox, Keypoints, Classification } from '~/utils/types/types';

// Keypoint names (you can expand or adjust these based on your model)

export function nonMaximumSuppression(detections: ObjectDetection[]): ObjectDetection[] {
  'worklet';

  // Helper function to calculate IoU
  function calculateIoU(boxA: BoundingBox, boxB: BoundingBox): number {
    'worklet';
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

  const finalDetections: ObjectDetection[] = [];

  while (detections.length > 0) {
    const current = detections.shift()!; // Highest confidence detection
    finalDetections.push(current);

    // Filter out detections with IoU >= threshold
    detections = detections.filter(
      (det) => calculateIoU(current.boundingBox, det.boundingBox) < YOLO_POSE_CONSTANTS.IOU_TRESHOLD
    );
  }

  return finalDetections;
}

function getClosestDetectionToCenter(detections: ObjectDetection[]): ObjectDetection | null {
  'worklet';
  let closestDetection = null;
  let closestDistance = Infinity;
  if (detections.length === 1) return detections[0];

  for (const detection of detections) {
    const distance = Math.sqrt(
      Math.pow(detection.boundingBox.xc - 0.5, 2) + Math.pow(detection.boundingBox.yc - 0.5, 2)
    );

    if (distance < closestDistance) {
      closestDistance = distance;
      closestDetection = detection;
    }
  }

  return closestDetection;
}

export function decodeYoloPoseOutput(
  outputTensor: any[],
  numDetections: number
): ObjectDetection | null {
  'worklet';
  const detections: ObjectDetection[] = [];

  for (let i = 0; i < numDetections; i++) {
    const confidence = outputTensor[0][i + numDetections * 4];
    if (confidence < YOLO_POSE_CONSTANTS.DETECTION_TRESHOLD) {
      continue;
    }
    const xc = outputTensor[0][i];
    const yc = outputTensor[0][i + numDetections];
    const w = outputTensor[0][i + numDetections * 2];
    const h = outputTensor[0][i + numDetections * 3];

    const y1 = 1 - (xc - w / 2); // Top-left y
    const x1 = yc - h / 2; // Top-left x
    const y2 = 1 - (xc + w / 2); // Bottom-right y
    const x2 = yc + h / 2; // Bottom-right x
    const keypoints: Keypoints = {};
    for (let j = 5; j < 56; j += 3) {
      const y = outputTensor[0][j * numDetections + i];
      const x = outputTensor[0][j * numDetections + i + numDetections];
      const keypointConfidence = outputTensor[0][j * numDetections + i + 2 * numDetections];
      const keypointIndex = Math.floor((j - 5) / 3);

      if (keypointConfidence < YOLO_POSE_CONSTANTS.KEYPOINT_TRESHOLD) {
        continue;
      }
      keypoints[keypointIndex] = {
        name: YOLO_POSE_CONSTANTS.KEYPOINTS[keypointIndex],
        coord: {
          x,
          y: 1 - y,
        },
        confidence: keypointConfidence,
      };
    }

    detections.push({
      boundingBox: {
        x1,
        y1,
        x2,
        y2,
        xc,
        yc,
        w,
        h,
      },
      confidence,
      keypoints,
    });
  }
  outputTensor.length = 0;
  // Apply NMS after decoding all detections
  return getClosestDetectionToCenter(nonMaximumSuppression(detections));
}

export function decodeYoloClassifyOutput(array: any): Classification {
  'worklet';
  if (array.length < 2) {
    throw new Error('Array must have at least two elements to compute confidence advantage.');
  }

  let maxIndex = 0;
  let maxValue = array[0];
  let secondMaxValue = -Infinity;

  for (let i = 1; i < array.length; i++) {
    if (array[i] > maxValue) {
      secondMaxValue = maxValue;
      maxValue = array[i];
      maxIndex = i;
    } else if (array[i] > secondMaxValue) {
      secondMaxValue = array[i];
    }
  }

  const confidenceAdvantage = maxValue - secondMaxValue;
  array = null;
  return {
    id: maxIndex,
    confidenceAdvantage,
  };
}
