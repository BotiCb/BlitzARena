import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native";

import {
  Camera,
  useCameraDevices,
  useCameraPermission,
  useFrameProcessor,
  Orientation,
  useCameraFormat,
  runAtTargetFps,
  useSkiaFrameProcessor,
} from "react-native-vision-camera";

import * as useResizePlugin from "vision-camera-resize-plugin";

import { TensorflowModel, useTensorflowModel } from "react-native-fast-tflite";

import {
  decodeYoloPoseOutput,
  drawDetections,
} from "../utils/frame-procesing-utils";

import { Detection, Pose } from "../utils/types";

import { useSharedValue, worklet, Worklets } from "react-native-worklets-core";
import { MOVENET_CONSTANTS } from "@/constants/MovenetConstants";
import { Skia } from "@shopify/react-native-skia";

function tensorToString(tensor: TensorflowModel["inputs"][number]): string {
  return `${tensor.dataType} [${tensor.shape}]`;
}

const CameraView = forwardRef((_, ref) => {
  const device = useCameraDevices()[0]; // Using back camera as default

  const { hasPermission, requestPermission } = useCameraPermission();
  if (!hasPermission) {
    requestPermission();
  }

  const delegate = Platform.OS === "ios" ? "core-ml" : undefined;

  const plugin = useTensorflowModel(
    require("../assets/models/yolo11n-pose_saved_model/yolo11n-pose_integer_quant.tflite"),
    delegate
  );
  const plugin2 = useTensorflowModel(
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

  useEffect(() => {
    const model = plugin2.model;

    if (model == null) return;

    console.log(
      `Model2: ${model.inputs.map(tensorToString)} -> ${model.outputs.map(
        tensorToString
      )}`
    );
  }, [plugin2]);

  const { resize } = useResizePlugin.createResizePlugin();

  const detectedPose = useSharedValue<Pose | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      getPose: () => {
        return detectedPose.value;
      },
    }),
    []
  );
  const paint = Skia.Paint();
  paint.setColor(Skia.Color("red"));
  paint.setStrokeWidth(3);

  const lastDetectionsRef = useRef<Detection[]>([]); // Ref for detections
  const lastUpdateTimeRef = useRef<number>(Date.now());
  const detections = useSharedValue<Detection[]>([]);

  const frameProcessor = useSkiaFrameProcessor(
    (frame) => {
      "worklet";
      frame.render();
      console.log(frame.width, frame.height);
      if (plugin.state === "loaded") {
        runAtTargetFps(5, () => {
          "worklet";
          const resized = resize(frame, {
            scale: { width: 320, height: 320 },
            pixelFormat: "rgb",
            rotation: "90deg",
            dataType: "float32",
           crop: { x: 0, y: 0, width: 640, height: 480 },
          
          });

          const outputs = plugin.model.runSync([resized]);
          detections.value = decodeYoloPoseOutput(outputs, 2100, 5);

          if (detections.value.length > 0) {
            lastDetectionsRef.current = detections.value;
            lastUpdateTimeRef.current = Date.now();
            //console.log(detections[0].keypoints[0]);
          }
        });
      }

      const currentTime = Date.now();
      if (currentTime - lastUpdateTimeRef.current > 500) {
        lastDetectionsRef.current = [];
      }

      drawDetections(frame, detections.value, paint);
    },
    [plugin, detections]
  );

  const format = useCameraFormat(device, [
    {
      videoResolution: { height: 320, width: 320 },
    },
  ]);

  useEffect(() => {
    console.log("Camera Component rendered");
  }, []);

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
      {plugin.state ? (
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          frameProcessor={frameProcessor}
          pixelFormat="yuv"
         format={format}
          outputOrientation={"device"} // format={format}
        />
      ) : (
        <ActivityIndicator size="large" color={"#0000ff"} />
      )}
    </View>
  );
});

export default CameraView;

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
