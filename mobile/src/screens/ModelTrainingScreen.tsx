import React, { useEffect, useState } from 'react';
import { View, Text, Button, Platform } from 'react-native';
import { useTensorflowModel } from 'react-native-fast-tflite';

import { ModelTrainingWebSocketService } from '~/services/websocket/model-training.websocket.service';
import { TrainingImage } from '~/services/websocket/websocket-types';
import TrainingCameraView from '~/views/TraingCameraView';

const ModelTrainingScreen = () => {
  const [takePhotos, setTakePhotos] = useState(false);
  const [playerNumber, setPlayerNumber] = useState(0);
  const modelTrainingWebsocketService = ModelTrainingWebSocketService.getInstance();

  const handleImageCapture = (trainingImage: TrainingImage) => {
    modelTrainingWebsocketService.sendPhoto(trainingImage);
  };

  useEffect(() => {
    const handleTrainingReady = () => {
      setTakePhotos(false);
    };
    modelTrainingWebsocketService.setTrainingReadyForPlayerEventListener(handleTrainingReady);
  }, []);

  const delegate = Platform.OS === 'ios' ? 'core-ml' : undefined;

  const plugin = useTensorflowModel(
    require('../../assets/models/yolo11n-pose_integer_quant.tflite'),
    delegate
  );

  return (
    <View style={{ flex: 1 }}>
      <Text>ModelTrainingScreen Player: {playerNumber}</Text>
      {!takePhotos ? (
        <Button title="Take Photos" onPress={() => setTakePhotos(true)} />
      ) : (
        <Button title="Stop taking photos" onPress={() => setTakePhotos(false)} />
      )}
      <Button title="Next player " onPress={() => setPlayerNumber(playerNumber + 1)} />
      <Button title="Previous player " onPress={() => setPlayerNumber(playerNumber - 1)} />
      <Button
        title="Start training"
        onPress={() => modelTrainingWebsocketService.sendStartModelTraining()}
      />
      <TrainingCameraView
        takePhotos={takePhotos}
        handleImageCapture={handleImageCapture}
        playerNumber={playerNumber}
        plugin={plugin}
      />
    </View>
  );
};

export default ModelTrainingScreen;
