import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useTensorflowModel } from 'react-native-fast-tflite';

import { useGame } from '~/contexts/GameContext';
import { ModelTrainingWebSocketService } from '~/services/websocket/model-training.websocket.service';
import { Player } from '~/utils/models';
import { TrainingPhase } from '~/utils/types/types';

export const useTraining = () => {
  const { players } = useGame();
  const [takePhotos, setTakePhotos] = useState(false);
  const [trainingPlayer, setTrainingPlayer] = useState<Player | null>(null);
  const [trainingGroup, setTrainingGroup] = useState<Player[] | null>(null);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<TrainingPhase>('initializing');
  const modelTrainingWebsocketService = ModelTrainingWebSocketService.getInstance();
  const handleTrainingPlayer = (playerId: string | null) => {
    setTrainingPlayer(players.find((player) => player.sessionID === playerId) || null);
  };

  const handleTrainingGroup = (playerIds: string[] | null) => {
    setTrainingGroup(
      playerIds ? players.filter((player) => playerIds.includes(player.sessionID)) : null
    );
  };

  const delegate = Platform.OS === 'ios' ? 'core-ml' : undefined;

  const plugin = useTensorflowModel(
    require('../../assets/models/yolo11n-pose_integer_quant.tflite'),
    delegate
  );
  const handleTakephotosStateChange = (takePhotos: boolean) => {
    setTakePhotos(takePhotos);
    modelTrainingWebsocketService.setIsTakeingPhotos(takePhotos);
    if (takePhotos) {
      modelTrainingWebsocketService.takePhotos();
    }
  }

  useEffect(() => {
    modelTrainingWebsocketService.setIsTakingPhotosHandlerFunction(handleTakephotosStateChange);
    modelTrainingWebsocketService.setProgressHandlerFunction(setProgress);
    modelTrainingWebsocketService.setCurrentTrainingPlayerHandlerFunction(handleTrainingPlayer);
    modelTrainingWebsocketService.setTrainingGroupHandlerFunction(handleTrainingGroup);
    modelTrainingWebsocketService.setWebSocketEventListeners();
    modelTrainingWebsocketService.setPhaseHandlerFunction(setPhase);
    modelTrainingWebsocketService.readyForPhase();

    return () => {
      modelTrainingWebsocketService.close();
    };
  }, []);

  return {
    phase,
    trainingPlayer,
    trainingGroup,
    progress,
    plugin,
    takePhotos,
    handleTakephotosStateChange
  };
};
