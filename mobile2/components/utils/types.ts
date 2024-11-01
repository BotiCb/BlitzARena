export const bodyConnections = [
    [0, 1], [0, 2], [1, 3], [2, 4], // Head
    [5, 6], [5, 7], [7, 9], [6, 8], [8, 10], // Arms
    [11, 12], [5, 11], [6, 12], [11, 13], [12, 14], [13, 15], [14, 16] // Torso & Legs
  ];

  export type Keypoint = {
    y: number;
    x: number;
    score: number;
  };
  
  export type Pose = {
    keypoints: Keypoint[];
  };