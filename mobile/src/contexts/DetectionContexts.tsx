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
  detectedPerson: DetectedPerson | null;
  detections: ISharedValue<Detection | null>;
  classifyModel: TensorflowModel | null;
  poseModel: TensorflowModel | null;
  getHitPerson: () => HitPerson | null;
};

const DetectionContext = createContext<DetectionContextType>({} as DetectionContextType);

export const DetectionProvider = ({ children }: { children: React.ReactNode }) => {
  const [classifyModel, setClassifyModel] = useState<TensorflowModel | null>(null);
  const [poseModel, setPoseModel] = useState<TensorflowModel | null>(null);
  const { model, players } = useGame();
  const delegate = Platform.OS === 'ios' ? 'core-ml' : undefined;
  const [detectedPerson, setDetectedPerson] = useState<DetectedPerson | null>(null);
  const detections = useSharedValue<Detection | null>(null);
  const playersMap = useMemo(() => new Map(players.map((p) => [p.sessionID, p])), [players]);
  const detectedPersonRef = useRef<DetectedPerson | null>(null);

  const detectionHandler = useCallback(() => {
    //console.log('detections', detections.value);
    if (!detections.value) {
      if (detectedPersonRef.current) {
        detectedPersonRef.current = null;
        setDetectedPerson(null);
      }
      return;
    }

    const currentDetection = detections.value;
    const sessionID = model?.mapperArray[currentDetection.classification.id ?? 0];
    const player = sessionID ? playersMap.get(sessionID) : null;

    if (!player) {
      if (detectedPersonRef.current) {
        detectedPersonRef.current = null;
        setDetectedPerson(null);
      }
      return;
    }

    const newDetection: DetectedPerson = {
      player,
      bodyPart: currentDetection.bodyPart as BODY_PART,
      confidence: Math.round(currentDetection.classification.confidenceAdvantage * 100),
    };

    if (
      !detectedPersonRef.current ||
      detectedPersonRef.current.player.sessionID !== newDetection.player.sessionID ||
      detectedPersonRef.current.bodyPart !== newDetection.bodyPart
    ) {
      detectedPersonRef.current = newDetection;
      console.log('New detection', newDetection);
      setDetectedPerson(newDetection);
    }
  }, [playersMap, model?.mapperArray]);

  useEffect(() => {
    const interval = setInterval(detectionHandler, 200);
    return () => clearInterval(interval);
  }, [detectionHandler]);



  useEffect(() => {
    if (model?.path) {
      loadTensorflowModel({
        url: "file://" + model.path,
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
  }

  const value =
  {
    detectedPerson,
    detections,
    classifyModel,
    poseModel,
    getHitPerson
  }


  return (
    <DetectionContext.Provider value={value}>
      {children}
    </DetectionContext.Provider>
  );

};

export const useDetection = () => useContext(DetectionContext);
