import React, { useEffect } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import {
  Camera,
  useCameraDevices,
  useCameraPermission,
  useFrameProcessor,
} from "react-native-vision-camera";
import * as useResizePlugin from "vision-camera-resize-plugin";
import { TensorflowModel, useTensorflowModel } from "react-native-fast-tflite";
import { mapToPose } from "./utils/frame-procesing";

function tensorToString(tensor: TensorflowModel["inputs"][number]): string {
  return `${tensor.dataType} [${tensor.shape}]`;
}

const CameraView = () => {
  const device = useCameraDevices()[0]; // Using back camera as default
  const { hasPermission } = useCameraPermission();
  const delegate = Platform.OS === "ios" ? "core-ml" : undefined;
  const plugin = useTensorflowModel(
    require("C:/Allamvizsga/allamvizsgaProjekt/mobile2/assets/models/4.tflite"),
    delegate
  );
  useEffect(() => {
    const model = plugin.model;
    if (model == null) {
      return;
    }
    console.log(
      `Model: ${model.inputs.map(tensorToString)} -> ${model.outputs.map(
        tensorToString
      )}`
    );
  }, [plugin]);
  const inputTensor = plugin.model?.inputs[0];
  const inputWidth = inputTensor?.shape[1] ?? 0;
  const inputHeight = inputTensor?.shape[2] ?? 0;
  if (inputTensor != null) {
    console.log(
      `Input: ${inputTensor.dataType} ${inputWidth} x ${inputHeight}`,
    );
  }

  if (!device || !hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Camera permission is required.
        </Text>
      </View>
    );
  }
  const {resize} = useResizePlugin.createResizePlugin();
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet'
    if (plugin.state === "loaded") {
      const resized = resize(frame, {
        scale: {
          width: 192,
          height: 192,
        },
        pixelFormat: 'rgb',
        dataType: 'uint8',
    })
      const outputs = plugin.model.runSync([resized])
      console.log(mapToPose(outputs[0]).keypoints.filter(k => k.score > 0.5));
    }
  }, [plugin])
    
  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill} // Fills the entire screen
        device={device}
        isActive= {true}
        frameProcessor={frameProcessor}
        pixelFormat="yuv"
      />
    </View>
  );
};

export default CameraView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
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


