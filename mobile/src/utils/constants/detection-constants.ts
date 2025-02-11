export const YOLO_POSE_CONSTANTS = {
  KEYPOINTS: [
    'Nose',
    'Left Eye',
    'Right Eye',
    'Left Ear',
    'Right Ear',
    'Left Shoulder',
    'Right Shoulder',
    'Left Elbow',
    'Right Elbow',
    'Left Wrist',
    'Right Wrist',
    'Left Hip',
    'Right Hip',
    'Left Knee',
    'Right Knee',
    'Left Ankle',
    'Right Ankle',
  ],

  BODY_CONNECTIONS: [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4], // Head and eyes
    [5, 6],
    [5, 7],
    [7, 9],
    [6, 8],
    [8, 10], // Arms
    [11, 12],
    [5, 11],
    [6, 12], // Torso
    [11, 13],
    [13, 15],
    [12, 14],
    [14, 16], // Legs
  ],
  KEYPOINT_TRESHOLD: 0.4,
  IOU_TRESHOLD: 0.5,
  DETECTION_TRESHOLD: 0.5,
};

export const BODY_PART_DETECTIONS_CONSTANTS = {
  CENTER_POINT: {
    x: 0.5,
    y: 0.5,
  },
  CHEST_SIDES_PADDING: 0.28,
  CHEST_TOP_PADDING: 0.28,
  LOWER_LEG_PADDING: 0.28,
  UPPER_LEG_PADDING: 0.28,
  LOWER_ARM_PADDING: 0.28,
  UPPER_ARM_PADDING: 0.28,
};
