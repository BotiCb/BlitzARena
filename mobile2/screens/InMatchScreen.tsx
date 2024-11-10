import CameraView from "@/components/CameraView";

import Skeleton from "@/components/SkeletonView";

import { useCallback, useEffect, useRef, useState } from "react";

import { View, Text, Dimensions } from "react-native";

import * as ScreenOrientation from "expo-screen-orientation";
import { Pose } from "@/components/utils/types";
import { MOVENET_CONSTANTS } from "@/constants/MovenetConstants";

const InMatchScreen = () => {
  const [pose, setPose] = useState<Pose | null>(null);

  const { width, height } = Dimensions.get("window");


  const cameraRef = useRef<any>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      cameraRef.current?.getPose(); // console.log(cameraRef.current?.getPose());

      setPose(cameraRef.current?.getPose());
    }, 1000/MOVENET_CONSTANTS.FPS);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <CameraView ref={cameraRef} />
      {pose && <Skeleton pose={pose} width={width} height={height} />}
    </View>
  );
};

export default InMatchScreen ;
