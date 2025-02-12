import React, { useEffect, useState } from 'react';
import { View, Text, Button, Platform } from 'react-native';
import { useTensorflowModel } from 'react-native-fast-tflite';

import { useGame } from '~/contexts/GameContext';
import { ModelTrainingWebSocketService } from '~/services/websocket/model-training.websocket.service';
import { TrainingImage } from '~/services/websocket/websocket-types';
import TrainingCameraView from '~/views/TraingCameraView';

const ModelTrainingScreen = () => {
  const { players } = useGame();
  const [takePhotos, setTakePhotos] = useState(false);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [playerId, setPlayerId] = useState<string>(players[playerIndex].sessionID);
  const [progress, setProgress] = useState(0);
  const modelTrainingWebsocketService = ModelTrainingWebSocketService.getInstance();

  const handleImageCapture = (trainingImage: TrainingImage) => {
    modelTrainingWebsocketService.sendPhoto(trainingImage);
  };

  useEffect(() => {
    modelTrainingWebsocketService.setTakingPhotosHandlerFunction(setTakePhotos);
    modelTrainingWebsocketService.setProgressHandlerFunction(setProgress);
    modelTrainingWebsocketService.setWebSocketEventListeners();
  }, []);

  const delegate = Platform.OS === 'ios' ? 'core-ml' : undefined;

  const plugin = useTensorflowModel(
    require('../../assets/models/yolo11n-pose_integer_quant.tflite'),
    delegate
  );
  const setCurrentPlayer = (delta: number) => {
    if (delta > 0) {
      if (playerIndex < players.length - 1) {
        setPlayerIndex(playerIndex + delta);
      }
    }
    if (delta < 0) {
      if (playerIndex > 0) {
        setPlayerIndex(playerIndex + delta);
      }
    }
    setPlayerId(players[playerIndex].sessionID);
  };

  return (
    <View style={{ flex: 1 }}>
      <Text>Progress: {progress}</Text>
      <Text>Player: {players[playerIndex].firstName + ' ' + players[playerIndex].lastName}</Text>
      {!takePhotos ? (
        <Button title="Take Photos" onPress={() => setTakePhotos(true)} />
      ) : (
        <Button title="Stop taking photos" onPress={() => setTakePhotos(false)} />
      )}
      <Button title="Next player " onPress={() => setCurrentPlayer(1)} />
      <Button title="Previous player " onPress={() => setCurrentPlayer(-1)} />
      <TrainingCameraView
        takePhotos={takePhotos}
        handleImageCapture={handleImageCapture}
        playerId={playerId}
        plugin={plugin}
      />
    </View>
  );
};

export default ModelTrainingScreen;
