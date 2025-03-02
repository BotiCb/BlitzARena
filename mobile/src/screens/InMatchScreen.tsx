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
import { useDetections } from "~/hooks/useDetections";
import { PlayerListComponent } from "~/components/PlayerListComponent";

const InMatchScreen = () => {
  const cameraRef = useRef<any>(null);
  const { classifyModel, poseModel, detectedPerson, detections } = useDetections();
  const { isPhaseInfosNeeded, players, areYouHost, userSessionId, onRemovePlayer, setPlayerAsHost } = useGame();
  const { round, maxRounds, matchPhase } = useMatch();

  if(isPhaseInfosNeeded || !classifyModel || !poseModel) {
    return <SplashScreen />
  }

  return (
    <View style={{ flex: 1 }}>
     
    <CameraView
      ref={cameraRef}
      models={[poseModel, classifyModel]}
      detections={detections}
    />
    
    <Text style={{ color: "white" }}>{detectedPerson?.player.firstName + " " + detectedPerson?.player.lastName + " " + detectedPerson?.bodyPart + " " + detectedPerson?.confidence}</Text>
    <Text style={{ color: "white" }}>Round: {round} / {maxRounds} - {matchPhase} </Text>
    <PlayerListComponent
    players={players}
    areYouHost={areYouHost}
    onSetAsHost={setPlayerAsHost}
    yourSessionId={userSessionId}
    onRemovePlayer={onRemovePlayer}
    />
    </View>
  );
};

export default InMatchScreen;
