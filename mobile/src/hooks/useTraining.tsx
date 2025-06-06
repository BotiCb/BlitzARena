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
    setTrainingPlayer(
      (() => {
        const foundPlayer = players.find((player) => player.sessionID === playerId);
        return foundPlayer ? { ...foundPlayer, isReady: false } : null;
      })()
    );
  };

  const handleTrainingGroup = (playerIds: string[] | null) => {
    setTrainingGroup(
      playerIds
        ? players
            .filter((player) => playerIds.includes(player.sessionID))
            .map((player) => ({ ...player, isReady: false }))
        : null
    );
  };

  const handleTakephotosStateChange = (takePhotos: boolean) => {
    setTakePhotos(takePhotos);
    modelTrainingWebsocketService.setIsTakeingPhotos(takePhotos);
    if (takePhotos) {
      modelTrainingWebsocketService.takePhotos();
    }
  };

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
    takePhotos,
    handleTakephotosStateChange,
  };
};
