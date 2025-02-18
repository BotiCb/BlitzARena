import React, { useEffect, useState } from 'react';
import { View, Text, Button, Platform } from 'react-native';
import { useTensorflowModel } from 'react-native-fast-tflite';

import { useGame } from '~/contexts/GameContext';
import { ModelTrainingWebSocketService } from '~/services/websocket/model-training.websocket.service';
import { TrainingImage } from '~/services/websocket/websocket-types';
import { Player } from '~/utils/models';
import { isMe } from '~/utils/utils';
import TrainingCameraView from '~/views/TraingCameraView';

const ModelTrainingScreen = () => {
  const { players, userSessionId } = useGame();
  const [takePhotos, setTakePhotos] = useState(false);
  const [trainingPlayer, setTrainingPlayer] = useState<Player | null>(null);
  const [trainingGroup, setTrainingGroup] = useState<Player[] | null>(null);
  const [progress, setProgress] = useState(0);
  const modelTrainingWebsocketService = ModelTrainingWebSocketService.getInstance();

  const handleTrainingPlayer = (playerId: string) => {
    setTrainingPlayer(players.find((player) => player.sessionID === playerId) || null);
  };

  const handleTrainingGroup = (playerIds: string[] | null) => {
    setTrainingGroup(
      playerIds ? players.filter((player) => playerIds.includes(player.sessionID)) : null
    );
  };

  useEffect(() => {
    modelTrainingWebsocketService.setTakingPhotosHandlerFunction(setTakePhotos);
    modelTrainingWebsocketService.setProgressHandlerFunction(setProgress);
    modelTrainingWebsocketService.setCurrentTrainingPlayerHandlerFunction(handleTrainingPlayer);
    modelTrainingWebsocketService.setTrainingGroupHandlerFunction(handleTrainingGroup);
    modelTrainingWebsocketService.setWebSocketEventListeners();
    modelTrainingWebsocketService.readyForTraining();
  }, []);

  const delegate = Platform.OS === 'ios' ? 'core-ml' : undefined;

  const plugin = useTensorflowModel(
    require('../../assets/models/yolo11n-pose_integer_quant.tflite'),
    delegate
  );

  return (
    <View style={{ flex: 1 }}>
      <Text>Training Group</Text>
      {trainingGroup?.map((player) => (
        <Text key={player.sessionID}>{player.firstName + ' ' + player.lastName}</Text>
      ))}
      <Text>Progress: {progress}</Text>
      <Text>Player: {trainingPlayer?.firstName + ' ' +  trainingPlayer?.lastName}</Text>
      {!takePhotos ? (
        <Button title="Take Photos" onPress={() => setTakePhotos(true)} />
      ) : (
        <Button title="Stop taking photos" onPress={() => setTakePhotos(false)} />
      )}
      {!isMe(trainingPlayer, userSessionId) ? (
        <TrainingCameraView
          takePhotos={takePhotos}
          handleImageCapture={modelTrainingWebsocketService.takePhoto}
          playerId={trainingPlayer?.sessionID || ''}
          plugin={plugin}
        />
      ) : (
        <View>
          <Text>Not your turn</Text>
        </View>
      )}
    </View>
  );
};

export default ModelTrainingScreen;
