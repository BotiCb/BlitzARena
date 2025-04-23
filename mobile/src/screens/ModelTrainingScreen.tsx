import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

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
    <View style={styles.container}>
      {/* {trainingGroup && (
      //  <PlayerListComponent 
      //  players={players.filter((player) => trainingGroup?.some((p) => p.sessionID === player.sessionID))}
      //   areYouHost={false}
      //   onSetAsHost={() => {}}
      //   yourSessionId={userSessionId}
      //   onRemovePlayer={() => {}}
      //  />

        
      // )} */}
      <ProgressBar progress={progress} label="Collecting Data" />

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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ModelTrainingScreen;
