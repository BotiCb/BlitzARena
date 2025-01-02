export const bodyConnections = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 4], // Head
  [5, 6],
  [5, 7],
  [7, 9],
  [6, 8],
  [8, 10], // Arms
  [11, 12],
  [5, 11],
  [6, 12],
  [11, 13],
  [12, 14],
  [13, 15],
  [14, 16], // Torso & Legs
];

export type BoundingBox = {
  xc: number;
  yc: number;
  w: number;
  h: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type ObjectDetection = {
  keypoints: Keypoints | null;
  boundingBox: BoundingBox;
  confidence: number;
};

export type Keypoints = {
  [index: number]: Keypoint;
};

export type Keypoint = {
  coord: Point;
  confidence: number;
  name: string;
};

export type Classification = {
  id: number;
  confidenceAdvantage: number;
};

export type Detection = {
  objectDetection: ObjectDetection;
  classification: Classification;
  bodyPart: BODY_PART;
};

export enum KEYPOINTS {
  NOSE = 0,
  LEFT_EYE = 1,
  RIGHT_EYE = 2,
  LEFT_EAR = 3,
  RIGHT_EAR = 4,
  LEFT_SHOULDER = 5,
  RIGHT_SHOULDER = 6,
  LEFT_ELBOW = 7,
  RIGHT_ELBOW = 8,
  LEFT_WRIST = 9,
  RIGHT_WRIST = 10,
  LEFT_HIP = 11,
  RIGHT_HIP = 12,
  LEFT_KNEE = 13,
  RIGHT_KNEE = 14,
  LEFT_ANKLE = 15,
  RIGHT_ANKLE = 16,
}

export enum BODY_PART {
  HEAD,
  CHEST,
  ARM,
  LEG,
  NOTHING,
}

export type Point = {
  x: number;
  y: number;
};
