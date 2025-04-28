import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { ISharedValue, useSharedValue } from 'react-native-worklets-core';
import { BODY_PART, DetectedPerson, Detection } from '~/utils/types/detection-types';
import { Player } from '~/utils/models';
import { useGame } from '~/contexts/GameContext';
import { loadTensorflowModel, TensorflowModel, useTensorflowModel } from 'react-native-fast-tflite';
import { Platform } from 'react-native';
import { HitPerson } from '~/services/websocket/websocket-types';

type DetectionContextType = {
  detectedPlayer: string;
  detections: ISharedValue<Detection | null>;
  classifyModel: TensorflowModel | null;
  poseModel: TensorflowModel | null;
  getHitPerson: () => HitPerson | null;
  runModel: ISharedValue<boolean>;
};

const DetectionContext = createContext<DetectionContextType>({} as DetectionContextType);

export const DetectionProvider = ({ children }: { children: React.ReactNode }) => {
  const [classifyModel, setClassifyModel] = useState<TensorflowModel | null>(null);
  const [poseModel, setPoseModel] = useState<TensorflowModel | null>(null);
  const { model, players } = useGame();
  const delegate = Platform.OS === 'ios' ? 'core-ml' : undefined;
  const [detectedPlayer, setDetectedPlayer] = useState<string>('');
  const detections = useSharedValue<Detection | null>(null);
  const runModel = useSharedValue<boolean>(false);

  useEffect(() => {
    const updateDetectedPerson = () => {
      if (detections.value && detections.value.bodyPart !== BODY_PART.NOTHING) {
        if (detectedPlayer !== model?.mapperArray[detections.value.classification.id]) {
          setDetectedPlayer(model?.mapperArray[detections.value.classification.id] as string);
        }
      } else {
        setDetectedPlayer('');
      }
    };
    const interval = setInterval(() => {
      updateDetectedPerson();
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    console.log(detectedPlayer);
  }, [detectedPlayer]);

  useEffect(() => {
    if (model?.path) {
      loadTensorflowModel({
        url: 'file://' + model.path,
      }).then((model) => {
        console.warn('Classify Model loaded');
        setClassifyModel(model);
      });
    }
  }, [model]);

  const plugin = useTensorflowModel(
    require(`../../assets/models/yolo11n-pose_integer_quant.tflite`),
    delegate
  );

  useEffect(() => {
    if (plugin.model) {
      setPoseModel(plugin.model);
    }
  }, [plugin]);

  const getHitPerson = (): HitPerson | null => {
    const detection = detections.value;

    if (!detection) {
      return null;
    }

    const sessionID = model?.mapperArray[detection.classification.id ?? 0] as string;

    return {
      hitPlayerId: sessionID,
      bodyPart: detection.bodyPart as BODY_PART,
      confidence: Math.round(detection.classification.confidenceAdvantage * 100),
    };
  };

  const value = {
    detectedPlayer,
    detections,
    classifyModel,
    poseModel,
    getHitPerson,
    runModel,
  };

  return <DetectionContext.Provider value={value}>{children}</DetectionContext.Provider>;
};

export const useDetection = () => useContext(DetectionContext);
