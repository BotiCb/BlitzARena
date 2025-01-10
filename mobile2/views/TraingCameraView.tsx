import React, { useEffect, useRef } from "react";
import RNFS from "react-native-fs";
import { View, Text, StyleSheet } from "react-native";
import { Camera, useCameraDevices, useCameraPermission, useCameraFormat } from "react-native-vision-camera";
import { Skia } from "@shopify/react-native-skia";
import { ObjectDetection } from "@/services/utils/types";
import { TensorflowModel, TensorflowPlugin, useTensorflowModel } from "react-native-fast-tflite";
import { TrainingImage } from "@/services/websocket/utils/types";
import { useSharedValue } from "react-native-worklets-core";
import ImageEditor from "@react-native-community/image-editor";
import { ImageCropData } from "@react-native-community/image-editor/lib/typescript/src/types";
import { trainingFrameProcessor } from "@/services/frame-processing/frame-processors";
import { takeCroppedTrainingImage } from "@/services/frame-processing/training-camera-utils";

interface TrainingCameraViewProps {
  takePhotos: boolean;
  handleImageCapture: (trainingImage: TrainingImage) => void;
  lastDetectionsRef: React.MutableRefObject<ObjectDetection[]>;
  playerNumber: number;
  plugin: TensorflowPlugin;
}
function tensorToString(tensor: TensorflowModel["inputs"][number]): string {
  return `${tensor.dataType} [${tensor.shape}]`;
}

const TrainingCameraView: React.FC<TrainingCameraViewProps> = ({
  takePhotos,
  handleImageCapture,
  lastDetectionsRef,
  playerNumber,
  plugin,
}) => {
  const camera = useRef<Camera>(null);
  const device = useCameraDevices()[0];
  const { hasPermission, requestPermission } = useCameraPermission();
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const format = useCameraFormat(device, [
    {
      videoResolution: { width: 640, height: 480 },
      //photoResolution: { width: 4000, height: 4000*(3/4) },
    },
  ]);
  const lastUpdateTime = useSharedValue<number>(Date.now());

  useEffect(() => {
    if (!takePhotos || !hasPermission) {
      return;
    }

    const interval = setInterval(async () => {
      if (camera.current && detections.value) {
        try {
          const trainingImage = await takeCroppedTrainingImage(
            camera.current,
            detections,
            lastUpdateTime,
            playerNumber,
            takePhotos,
          );
          if (trainingImage) {
            handleImageCapture(trainingImage);
          }
        } catch (error) {
          console.error("Error cropping image:", error);
        }
      }
    }, 500); // Capture photo every 500ms

    return () => clearInterval(interval);
  }, [takePhotos, handleImageCapture, hasPermission]);
  const paint = Skia.Paint();
  paint.setColor(Skia.Color("red"));
  paint.setStrokeWidth(3);

  useEffect(() => {
    const model = plugin.model;

    if (model == null) return;

    console.log(`Model: ${model.inputs.map(tensorToString)} -> ${model.outputs.map(tensorToString)}`);
  }, [plugin]);

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
        isActive={true}
        pixelFormat="yuv"
        outputOrientation="preview"
        photo={true}
        ref={camera}
        format={format}
        frameProcessor={trainingFrameProcessor(plugin, lastUpdateTime, detections, paint)}
      />
    </View>
  );
};

export default TrainingCameraView;

const styles = StyleSheet.create({
  container: {
    flex: 1,

    justifyContent: "center",

    alignItems: "center",
  },

  permissionContainer: {
    flex: 1,

    justifyContent: "center",

    alignItems: "center",

    backgroundColor: "white",
  },

  permissionText: {
    fontSize: 16,

    color: "gray",
  },
});
