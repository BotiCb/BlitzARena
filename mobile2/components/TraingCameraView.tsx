import React, { forwardRef, useEffect, useRef } from "react";
import RNFS from "react-native-fs";
import * as useResizePlugin from "vision-camera-resize-plugin";
import { View, Text, StyleSheet, Platform } from "react-native";
import modelTrainingWebsocketService from "@/services/websocket/model-training.websocket.service";
import {
  Camera,
  useCameraDevices,
  useCameraPermission,
  useCameraFormat,
  useSkiaFrameProcessor,
  runAtTargetFps,
} from "react-native-vision-camera";
import { Skia } from "@shopify/react-native-skia";
import { Detection } from "@/utils/types";
import { TensorflowModel, useTensorflowModel } from "react-native-fast-tflite";
import { decodeYoloOutput, drawDetections } from "@/utils/frame-procesing-utils";
import { TrainingImage } from "@/services/websocket/utils/types";
import { useSharedValue } from "react-native-worklets-core";

interface TrainingCameraViewProps {
  takePhotos: boolean;
  handleImageCapture: (trainingImage: TrainingImage) => void;
  lastDetectionsRef: React.MutableRefObject<Detection[]>
}
function tensorToString(tensor: TensorflowModel["inputs"][number]): string {
  return `${tensor.dataType} [${tensor.shape}]`;
}

const TrainingCameraView: React.FC<TrainingCameraViewProps> = ({
  takePhotos,
  handleImageCapture,
  lastDetectionsRef
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
    { photoResolution: { width: 1280, height: 720 } }
  ])

  useEffect(() => {
    if (!takePhotos || !hasPermission) return; 

    const interval = setInterval(async () => {
      if (camera.current) {
        const photo = await camera.current.takePhoto();
        if (photo) {
          const base64Image = await RNFS.readFile(photo.path, "base64");
          const trainingImage: TrainingImage = {
              photo: base64Image,
              detections: detections.value[0]
          }
         
          handleImageCapture(trainingImage);
        }
      }
    }, 1000); // Capture photo every 1 second

    return () => clearInterval(interval);

  }, [takePhotos, handleImageCapture, hasPermission]);
  const paint = Skia.Paint();
  paint.setColor(Skia.Color("red"));
  paint.setStrokeWidth(3);
  const { resize } = useResizePlugin.createResizePlugin();
  // Ref for detections
  const lastUpdateTimeRef = useRef<number>(Date.now());

  const delegate = Platform.OS === "ios" ? "core-ml" : undefined;

  const plugin = useTensorflowModel(
    require("../assets/models/yolo11n-pose_saved_model/yolo11n-pose_integer_quant.tflite"),
    delegate
  );

  useEffect(() => {
    const model = plugin.model;

    if (model == null) return;

    console.log(
      `Model: ${model.inputs.map(tensorToString)} -> ${model.outputs.map(
        tensorToString
      )}`
    );
  }, [plugin]);


  const detections= useSharedValue<Detection[]>([]);

  const frameProcessor = useSkiaFrameProcessor(
    (frame) => {
      "worklet";
      frame.render();
      if (plugin.state === "loaded") {
        runAtTargetFps(1, () => {
          "worklet";
          const resized = resize(frame, {
            scale: { width: 320, height: 320 },
            pixelFormat: "rgb",
            rotation: "90deg",
            dataType: "float32",
          });

          const outputs = plugin.model.runSync([resized]);
          detections.value = decodeYoloOutput(outputs, 2100, 5);

          if (detections.value.length > 0) {
            lastDetectionsRef.current = detections.value;
            lastUpdateTimeRef.current = Date.now();
           //console.log(detections[0].keypoints[0]);
          }
          
        },);
      }

      const currentTime = Date.now();
      if (currentTime - lastUpdateTimeRef.current > 500) {
        lastDetectionsRef.current = []; 
      }
    
    drawDetections(frame, detections.value, paint)
    },
    [plugin, detections]
  );



  if (!device || !hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Camera permission is required.
        </Text>
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
        outputOrientation={"device"}
        photo={true}
        ref={camera}
        format={format}
        frameProcessor={frameProcessor}
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
