import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import { useTensorflowModel } from 'react-native-fast-tflite';
import { useSharedValue } from 'react-native-worklets-core';

import { Scope } from '../components/Scope';
import { Detection } from '../utils/types/detection-types';
import CameraView from '../views/InMatchCameraView';

import { useGame } from '~/contexts/GameContext';
import { useMatch } from '~/contexts/MatchContext';
import SplashScreen from './SplashScreen';
import { useDetection } from '~/contexts/DetectionContexts';
import { InMatchWaitingForPlayersView } from '~/views/InMatchWaitingForPlayersView';
import InMatchBattleView from '~/views/InMatchBattleView';

const InMatchScreen = () => {
  const cameraRef = useRef<any>(null);
  const { classifyModel, poseModel, detections, runModel } = useDetection();
  const { isPhaseInfosNeeded } = useGame();
  const { round, maxRounds, matchPhase, score, winningTeam } = useMatch();

  useEffect(() => {
    if(matchPhase === 'battle'){
      runModel.value = true;
    }
    else{
      runModel.value = false;
    }
  }, [matchPhase]);

  if (!classifyModel || !poseModel || isPhaseInfosNeeded) {
    return <SplashScreen />;
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} models={[poseModel, classifyModel]} detections={detections} runModel={runModel} />


      <Text style={{ color: 'white' }}>
        Round: {round} / {maxRounds} - {matchPhase}{' '}
      </Text>
      {score && <Text style={{ color: 'white' }}> Score: {Object.keys(score).map((key) => `${key}: ${score[key]} `)} </Text>}
      {winningTeam && <Text style={{ color: 'white', fontSize: 20 }}> Winner: {winningTeam} </Text>}
      {matchPhase === 'battle' && <InMatchBattleView />}
      {matchPhase === 'waiting-for-players' && <InMatchWaitingForPlayersView />}

    </View>
  );
};

export default InMatchScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});