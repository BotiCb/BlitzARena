import { useAppState } from '@react-native-community/hooks';
import { useIsFocused } from '@react-navigation/native';
import { Skia } from '@shopify/react-native-skia';
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { TensorflowModel, TensorflowPlugin } from 'react-native-fast-tflite';
import { Camera, useCameraDevices, useCameraPermission } from 'react-native-vision-camera';
import { useSharedValue } from 'react-native-worklets-core';

import { trainingFrameProcessor } from '~/services/frame-processing/frame-processors';
import { takeCroppedTrainingImage } from '~/services/frame-processing/training-camera-utils';
import { ModelTrainingWebSocketService } from '~/services/websocket/model-training.websocket.service';
import { TrainingImage } from '~/services/websocket/websocket-types';
import { TRAINING_CAMERA_CONSTANTS } from '~/utils/constants/frame-processing-constans';
import { ObjectDetection } from '~/utils/types/detection-types';

interface TrainingCameraViewProps {
  takePhotos: boolean;
  playerId: string;
  model: TensorflowModel;
  handleTakePhotos: (takePhotos: boolean) => void;
}
function tensorToString(tensor: TensorflowModel['inputs'][number]): string {
  return `${tensor.dataType} [${tensor.shape}]`;
}

const TrainingCameraView: React.FC<TrainingCameraViewProps> = ({
  takePhotos,
  playerId,
  model,
  handleTakePhotos,
}) => {
  const isFocused = useIsFocused();
  const appState = useAppState();
  const isActive = isFocused && appState === 'active';
  const lastUpdateTime = useSharedValue<number>(Date.now());

  const camera = useRef<Camera>(null);
  const device = useCameraDevices()[0];
  const { hasPermission, requestPermission } = useCameraPermission();

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);


  // const format = useCameraFormat(device, [
  //   {
  //     videoResolution: {
  //       width: TRAINING_CAMERA_CONSTANTS.WIDTH,
  //       height: TRAINING_CAMERA_CONSTANTS.HEIGHT,
  //     },
  //   },
  // ]);


  const capturePhotos = async (): Promise<TrainingImage> => {
    if (!camera.current) {
      throw new Error('No camera');
    }
    if (!model) {
      throw new Error('No model');
    }
    const captureStart = Date.now();
    if (!detections.value) {
      throw new Error('No detections');
    }

    const trainingImage = await takeCroppedTrainingImage(
      camera.current,
      detections,
      lastUpdateTime,
      playerId,
      TRAINING_CAMERA_CONSTANTS.OUTPUT_IMAGE_SIZE
    );
    const captureDuration = Date.now() - captureStart;

    console.log('Picture took in ms', captureDuration);

    return trainingImage;
  };

  const modeltrainingWebsokcetService = ModelTrainingWebSocketService.getInstance();

  useEffect(() => {
    modeltrainingWebsokcetService.setTakePhotoFunction(capturePhotos)
  }, [])


  const paint = Skia.Paint();
  paint.setColor(Skia.Color(TRAINING_CAMERA_CONSTANTS.PAINT_COLOR));
  paint.setStrokeWidth(TRAINING_CAMERA_CONSTANTS.PAINT_STROKE_WIDTH);

  useEffect(() => {

    if (model == null) return;

    console.log(
      `Model: ${model.inputs.map(tensorToString)} -> ${model.outputs.map(tensorToString)}`
    );
  }, [model]);

  const detections = useSharedValue<ObjectDetection | null>(null);

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
        pixelFormat="yuv"
        outputOrientation="preview"
        photo
        ref={camera}
        // format={format}
        frameProcessor={trainingFrameProcessor(model, lastUpdateTime, detections, paint)}
      />
      {!takePhotos ? (
        <Button title="Take Photos" onPress={() => handleTakePhotos(true)} />
      ) : (
        <Button title="Stop taking photos" onPress={() => handleTakePhotos(false)} />
      )}
    </View>
  );
};

export default TrainingCameraView;

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
