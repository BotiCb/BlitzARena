import { useAppState } from '@react-native-community/hooks';
import { useIsFocused } from '@react-navigation/native';
import { Skia } from '@shopify/react-native-skia';
import React, { forwardRef, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableWithoutFeedback } from 'react-native';
import { TensorflowModel, TensorflowPlugin } from 'react-native-fast-tflite';
import { Camera, useCameraDevices, useCameraPermission } from 'react-native-vision-camera';
import { ISharedValue, useSharedValue } from 'react-native-worklets-core';

import {
  InBattleFrameProcessor,
  InBattleSkiaFrameProcessor,
} from '../services/frame-processing/frame-processors';
import { Detection } from '../utils/types/detection-types';
import { Scope } from '~/components/Scope';

function tensorToString(tensor: TensorflowModel['inputs'][number]): string {
  return `${tensor.dataType} [${tensor.shape}]`;
}

interface CameraViewProps {
  models: TensorflowModel[];
  detections: ISharedValue<Detection | null>;
  runModel: ISharedValue<boolean>;
}

const InMatchCameraView = forwardRef<any, CameraViewProps>(
  ({ models, detections, runModel }, ref) => {
    const device = useCameraDevices()[0];

    const isFocused = useIsFocused();
    const appState = useAppState();

    const isActive = isFocused && appState === 'active';

    const { hasPermission, requestPermission } = useCameraPermission();
    if (!hasPermission) {
      requestPermission();
    }
    const model = models[0];
    const model2 = models[1];
    useEffect(() => {
      if (model == null) return;

      console.log(
        `Model: ${model.inputs.map(tensorToString)} -> ${model.outputs.map(tensorToString)}`
      );
    }, [model]);

    useEffect(() => {
      if (model2 == null) return;

      console.log(
        `Model2: ${model2.inputs.map(tensorToString)} -> ${model2.outputs.map(tensorToString)}`
      );
    }, [model2]);

    const paint = Skia.Paint();
    paint.setColor(Skia.Color('red'));
    paint.setStrokeWidth(6);

    const lastUpdateTime = useSharedValue<number>(Date.now());

    useEffect(() => {
      console.log('Camera Component rendered');
    }, []);

    if (!device || !hasPermission) {
      return (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Camera permission is required.</Text>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isActive}
          frameProcessor={InBattleFrameProcessor(
            model,
            model2,
            lastUpdateTime,
            detections,
            runModel
          )}
          pixelFormat="yuv"
          outputOrientation="device"
        />
      </View>
    );
  }
);

export default InMatchCameraView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    width: '100%',
    height: '100%',
  },

  permissionContainer: {
    flex: 1,

    justifyContent: 'center',

    alignItems: 'center',

    backgroundColor: 'white',
  },

  permissionText: {
    fontSize: 16,

    color: 'gray',
  },
});
