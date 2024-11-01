import React from 'react';
import { View } from 'react-native';
import Svg, { Line, Circle } from 'react-native-svg';
import { bodyConnections } from './utils/types';
interface Keypoint {
  [key: string]: number;
}

// Define body part connections (pairs of keypoints to connect with lines)

interface SkeletonProps {
  keypoints: Keypoint;
}

const Skeleton: React.FC<SkeletonProps> = ({ keypoints }) => {
  const scale = 400; // Scale up keypoints for better visibility

  const renderConnections = () => {
    return bodyConnections.map(([start, end], index) => {
      const x1 = keypoints[start * 2] * scale;
      const y1 = keypoints[start * 2 + 1] * scale;
      const x2 = keypoints[end * 2] * scale;
      const y2 = keypoints[end * 2 + 1] * scale;

      return (
        <Line
          key={`line-${index}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="black"
          strokeWidth="2"
        />
      );
    });
  };

  const renderKeypoints = () => {
    return Object.keys(keypoints)
      .filter((key) => parseInt(key) % 2 === 0) // Filter x-coordinates only
      .map((key, index) => {
        const x = keypoints[key] * scale;
        const y = keypoints[(parseInt(key) + 1).toString()] * scale;

        return (
          <Circle
            key={`circle-${index}`}
            cx={x}
            cy={y}
            r="4"
            fill="blue"
          />
        );
      });
  };
  if(keypoints == null) {
    return null;
  }

  return (
    <View>
        
      <Svg height="400" width="400">
        {renderConnections()}
        {renderKeypoints()}
      </Svg>
    </View>
  );
};

export default Skeleton;
