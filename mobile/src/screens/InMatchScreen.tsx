import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Platform } from 'react-native';
import { useTensorflowModel } from 'react-native-fast-tflite';
import { useSharedValue } from 'react-native-worklets-core';

import { Scope } from '../components/Scope';
import { Detection } from '../utils/types/detection-types';
import CameraView from '../views/InMatchCameraView';

import { useGame } from '~/contexts/GameContext';
import { useMatch } from '~/hooks/useMatch';
import SplashScreen from './SplashScreen';
import { useDetection } from '~/contexts/DetectionContexts';
import { PlayerListComponent } from '~/components/PlayerListComponent';
import { InMatchWaitingForPlayersView } from '~/views/InMatchWaitingForPlayersView';
import InMatchRound from '~/views/InMatchRound';

const InMatchScreen = () => {
  const cameraRef = useRef<any>(null);
  const { classifyModel, poseModel, detections } = useDetection();
  const { isPhaseInfosNeeded } = useGame();
  const { round, maxRounds, matchPhase } = useMatch();

  if (!classifyModel || !poseModel) {
    return <SplashScreen />;
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView ref={cameraRef} models={[poseModel, classifyModel]} detections={detections} />

      
      <Text style={{ color: 'white' }}>
        Round: {round} / {maxRounds} - {matchPhase}{' '}
      </Text>
      <InMatchRound />
      {matchPhase === 'waiting-for-players' && <InMatchWaitingForPlayersView />}
    </View>
  );
};

export default InMatchScreen;
