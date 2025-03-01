import { useAppState } from '@react-native-community/hooks';
import { useIsFocused } from '@react-navigation/native';
import { Skia } from '@shopify/react-native-skia';
import React, { forwardRef, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { TensorflowModel, TensorflowPlugin } from 'react-native-fast-tflite';
import { Camera, useCameraDevices, useCameraPermission } from 'react-native-vision-camera';
import { ISharedValue, useSharedValue } from 'react-native-worklets-core';

import { InBattleFrameProcessor } from '../services/frame-processing/frame-processors';
import { Detection } from '../utils/types/detection-types';

function tensorToString(tensor: TensorflowModel['inputs'][number]): string {
  return `${tensor.dataType} [${tensor.shape}]`;
}

interface CameraViewProps {
  plugins: TensorflowPlugin[];
  detections: ISharedValue<Detection | null>;
}

const InMatchCameraView = forwardRef<any, CameraViewProps>(({ plugins, detections }, ref) => {
  const device = useCameraDevices()[0];

  const isFocused = useIsFocused();
  const appState = useAppState();

  const isActive = isFocused && appState === 'active';

  const { hasPermission, requestPermission } = useCameraPermission();
  if (!hasPermission) {
    requestPermission();
  }

  const plugin = plugins[0];
  const plugin2 = plugins[1];

  useEffect(() => {
    const model = plugin.model;

    if (model == null) return;

    console.log(
      `Model: ${model.inputs.map(tensorToString)} -> ${model.outputs.map(tensorToString)}`
    );
  }, [plugin]);

  useEffect(() => {
    const model = plugin2.model;

    if (model == null) return;

    console.log(
      `Model2: ${model.inputs.map(tensorToString)} -> ${model.outputs.map(tensorToString)}`
    );
  }, [plugin2]);

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
      {plugin.state ? (
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isActive}
          frameProcessor={InBattleFrameProcessor(plugin, plugin2, lastUpdateTime, detections)}
          pixelFormat="yuv"
          outputOrientation="device"
        />
      ) : (
        <ActivityIndicator size="large" color="#0000ff" />
      )}
    </View>
  );
});

export default InMatchCameraView;

const styles = StyleSheet.create({
  container: {
    flex: 1,

    justifyContent: 'center',

    alignItems: 'center',
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
