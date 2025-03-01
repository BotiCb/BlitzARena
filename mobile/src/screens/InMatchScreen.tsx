import React, { useEffect, useRef, useState } from "react";
import { View, Text, Platform } from "react-native";
import { useTensorflowModel } from "react-native-fast-tflite";
import { useSharedValue } from "react-native-worklets-core";

import { Scope } from "../components/Scope";
import { Detection } from "../utils/types/detection-types";
import CameraView from "../views/InMatchCameraView";

import { useGame } from "~/contexts/GameContext";
import { useMatch } from "~/hooks/useMatch";
import SplashScreen from "./SplashScreen";

const InMatchScreen = () => {
  const cameraRef = useRef<any>(null);
  const { classifyModel, poseModel, detectedPerson, detections } = useMatch();

  return (
    <View style={{ flex: 1 }}>
      {classifyModel && poseModel ? (
    <CameraView
      ref={cameraRef}
      models={[poseModel, classifyModel]}
      detections={detections}
    />
  ) : (
    <SplashScreen />
  )}
      <Scope />
      <Text style={{ color: "white" }}>{detectedPerson?.player.firstName + " " + detectedPerson?.player.lastName + " " + detectedPerson?.bodyPart + " " + detectedPerson?.confidence}</Text>
    </View>
  );
};

export default InMatchScreen;
