import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Line, Circle } from "react-native-svg";
import { bodyConnections, Pose } from "../utils/types";
import { Float } from "react-native/Libraries/Types/CodegenTypes";
import { MOVENET_CONSTANTS } from "@/constants/MovenetConstants";

// Define body part connections (pairs of keypoints to connect with lines)

interface SkeletonProps {
  pose: Pose;
  height: Float;
  width: Float;
}

const Skeleton: React.FC<SkeletonProps> = ({ pose, height, width }) => {
  useEffect(() => {
    console.log("Skeleton rendered ", height, width);
  }, []);

  return (
    <View style={styles.container}>
      <Svg>
        {pose.keypoints.map((keypoint, index) => (
          <Circle
            key={index}
            cy={keypoint.x * height}
            cx={width - keypoint.y * width}
            r={5}
            fill="red"
          />
        ))}
        {/* {MOVENET_CONSTANTS.BODY_CONNECTIONS.map(([startIdx, endIdx], index) => {
          const startKeypoint = pose.keypoints[startIdx];
          const endKeypoint = pose.keypoints[endIdx];

          // Check if both keypoints are valid before rendering the line
          if (startKeypoint && endKeypoint && startKeypoint.x != null && startKeypoint.y != null && endKeypoint.x != null && endKeypoint.y != null) {
            return (
              <Line
                key={`line-${index}`}
                x1={startKeypoint.x * width}
                y1={startKeypoint.y * height}
                x2={endKeypoint.x * width}
                y2={endKeypoint.y * height}
                stroke="blue"
                strokeWidth={2}
              />
            );
          }
          return null;
        })} */}
        <Circle cx={100} cy={0} r={5} fill={"red"} />
      </Svg>
    </View>
  );
};

export default Skeleton;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    position: "absolute",
    borderColor: "red",
    borderWidth: 1,
    height: "100%",
    width: "100%",
  },
});
