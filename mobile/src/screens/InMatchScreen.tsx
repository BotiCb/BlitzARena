import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Platform } from 'react-native';
import { useTensorflowModel } from 'react-native-fast-tflite';
import { useSharedValue } from 'react-native-worklets-core';

import { Scope } from '../components/Scope';
import { Detection } from '../utils/types/detection-types';
import CameraView from '../views/InMatchCameraView';
import { useGame } from '~/contexts/GameContext';

const InMatchScreen = () => {
  const { model } = useGame();
  const cameraRef = useRef<any>(null);
  const delegate = Platform.OS === 'ios' ? 'core-ml' : undefined;

  const plugin = useTensorflowModel(
    require('../../assets/models/yolo11n-pose_integer_quant.tflite'),
    delegate
  );
  const plugin2 = useTensorflowModel(require(model?.path || ''), delegate);
  const people = ['toni', 'bibi', 'pali', 'boti', 'zsuzsi'];
  const bodyParts = ['head', 'chest', 'arm', 'leg', 'nothing'];
  const [detectedPerson, setDetectedPerson] = useState<string>('');
  const detections = useSharedValue<Detection | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (detections.value) {
        setDetectedPerson(
          people[detections.value.classification.id] +
            ' ' +
            detections.value.classification.confidenceAdvantage +
            ' ' +
            bodyParts[detections.value.bodyPart] +
            ' '
        );
      } else {
        setDetectedPerson('');
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Text>{detectedPerson}</Text>
      <CameraView ref={cameraRef} plugins={[plugin, plugin2]} detections={detections} />

      <Scope />
    </View>
  );
};

export default InMatchScreen;
