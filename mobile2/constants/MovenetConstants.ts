

  export const MOVENET_CONSTANTS = {
    KEYPONTS : [
        "Nose",
        "Left Eye",
        "Right Eye",
        "Left Ear",
        "Right Ear",
        "Left Shoulder",
        "Right Shoulder",
        "Left Elbow",
        "Right Elbow",
        "Left Wrist",
        "Right Wrist",
        "Left Hip",
        "Right Hip",
        "Left Knee",
        "Right Knee",
        "Left Ankle",
        "Right Ankle"
      ],
      TRESHOLD : 0.25,
      FPS: 10,
      BODY_CONNECTIONS:  [
        [0, 1], [1, 2], [2, 3], [3, 4],           // Head and eyes
        [5, 6], [5, 7], [7, 9], [6, 8], [8, 10],   // Arms
        [11, 12], [5, 11], [6, 12],                // Torso
        [11, 13], [13, 15], [12, 14], [14, 16]     // Legs
      ]
  }
  