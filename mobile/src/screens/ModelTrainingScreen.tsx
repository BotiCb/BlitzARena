import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';

import SplashScreen from './SplashScreen';

import { useGame } from '~/contexts/GameContext';
import { useTraining } from '~/hooks/useTraining';
import { PhotosFromYouView } from '~/views/PhotosFromYouView';
import TrainingCameraView from '~/views/TraingCameraView';
import { TrainingReadyForGroupView } from '~/views/TrainingReadyForGroupView';
import { useDetection } from '~/contexts/DetectionContexts';
import { ProgressBar } from '~/atoms/ProgressBar';
import { PlayerInfo } from '~/atoms/PlayerInfo';
import { PlayerListComponent } from '~/components/PlayerListComponent';
import NeonText from '~/atoms/NeonText';

const ModelTrainingScreen = () => {
  const {
    trainingPlayer,
    trainingGroup,
    progress,
    phase,
    takePhotos,
    handleTakephotosStateChange,
  } = useTraining();
  const { poseModel } = useDetection();

  const { isPhaseInfosNeeded, userSessionId, players } = useGame();

  if (isPhaseInfosNeeded || !poseModel) {
    return <SplashScreen />;
  }

  return (
    <ImageBackground
      source={require('../../assets/ui/backgrounds/background.png')} // Make sure the image path is correct
      style={{ flex: 1}}
      resizeMode="cover">
      <View style={styles.container}>
      {progress > 0 && <ProgressBar progress={progress} />}

        {trainingGroup && (
       <PlayerListComponent 
       players={players.filter((player) => trainingGroup?.some((p) => p.sessionID === player.sessionID))}
        areYouHost={false}
        onSetAsHost={() => {}}
        yourSessionId={userSessionId}
        onRemovePlayer={() => {}}
       />

        
      )}
        

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
        {trainingPlayer && (
          <View style={{ padding: 10, paddingBottom: 70 }}>
            <NeonText>Current player:</NeonText>
            <PlayerInfo
              player={trainingPlayer}
              areYouHost={false}
              isYou={userSessionId === trainingPlayer.sessionID}
              onSetAsHost={() => {}}
              onRemovePlayer={() => {}}
            />
          </View>
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ModelTrainingScreen;
