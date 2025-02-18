import React from 'react';
import { View, Text } from 'react-native';

import SplashScreen from './SplashScreen';

import { useTraining } from '~/hooks/useTraining';
import { PhotosFromYouView } from '~/views/PhotosFromYouView';
import TrainingCameraView from '~/views/TraingCameraView';
import { TrainingReadyForGroupView } from '~/views/TrainingReadyForGroupView';

const ModelTrainingScreen = () => {
  const {
    takePhotos,
    trainingPlayer,
    trainingGroup,
    progress,
    handleTakePhotos,
    plugin,
    handleImageCapture,
    phase,
  } = useTraining();

  return (
    <View style={{ flex: 1 }}>
      <Text>Training Group</Text>
      <Text> {phase}</Text>
      {trainingGroup?.map((player) => (
        <Text key={player.sessionID}>{player.firstName + ' ' + player.lastName}</Text>
      ))}
      <Text>Progress: {progress}</Text>
      <Text>Player: {trainingPlayer?.firstName + ' ' + trainingPlayer?.lastName}</Text>
      {(() => {
        switch (phase) {
          case 'initializing':
            return <SplashScreen />;
          case 'photos-from-you':
            return <PhotosFromYouView />;
          case 'take-photos':
            return (
              <TrainingCameraView
                takePhotos={takePhotos}
                handleTakePhotos={handleTakePhotos}
                handleImageCapture={handleImageCapture}
                playerId={trainingPlayer?.sessionID || ''}
                plugin={plugin}
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
