import React from 'react';
import { View, Text } from 'react-native';

import SplashScreen from './SplashScreen';

import { useGame } from '~/contexts/GameContext';
import { useTraining } from '~/hooks/useTraining';
import { PhotosFromYouView } from '~/views/PhotosFromYouView';
import TrainingCameraView from '~/views/TraingCameraView';
import { TrainingReadyForGroupView } from '~/views/TrainingReadyForGroupView';
import { useDetection } from '~/contexts/DetectionContexts';
import { ProgressBar } from '~/atoms/ProgressBar';

const ModelTrainingScreen = () => {
  const {
    trainingPlayer,
    trainingGroup,
    progress,
    phase,
    takePhotos,
    handleTakephotosStateChange
  } = useTraining();
  const { poseModel } = useDetection();

  const { isPhaseInfosNeeded } = useGame();

  if (isPhaseInfosNeeded || !poseModel) {
    return <SplashScreen />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Text>Training Group</Text>
      <Text> {phase}</Text>
      {trainingGroup?.map((player) => (
        <Text key={player.sessionID}>{player.firstName + ' ' + player.lastName}</Text>
      ))}
      <ProgressBar  progress={progress} label='Collecting Data' />
      <Text>Player: {trainingPlayer?.firstName + ' ' + trainingPlayer?.lastName}</Text>
      {(() => {
        switch (phase) {
          case 'photos-from-you':
            return <PhotosFromYouView />;
          case 'take-photos':
            return (
              <TrainingCameraView
                playerId={trainingPlayer?.sessionID || ''}
                model={poseModel}
                takePhotos={takePhotos}
                handleTakePhotos={handleTakephotosStateChange}
              />
            );
          case 'training-ready-for-group':
            return <TrainingReadyForGroupView />;
          default:
            return <SplashScreen />;
        }
      })()}
    </View>
  );
};

export default ModelTrainingScreen;
