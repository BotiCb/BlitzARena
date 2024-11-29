import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
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
} from "react-native-vision-camera";

import * as useResizePlugin from "vision-camera-resize-plugin";

import { TensorflowModel, useTensorflowModel } from "react-native-fast-tflite";

import { decodeTensor, decodeYoloOutput, mapModelOutputWithNMS, mapToKeypoints, mapToPose, mapYOLOOutput, mapYoloOutputForOneClass, mapYoloPoseOutput, nonMaxSuppressionFromYolo, parseYoloOutput } from "../utils/frame-procesing";

import { Pose } from "../utils/types";

import { useSharedValue, worklet, Worklets } from "react-native-worklets-core";
import { MOVENET_CONSTANTS } from "@/constants/MovenetConstants";

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
    require("../assets/models/yolo11n-pose_saved_model/yolo11n-pose_float32.tflite"),

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

  const frameProcessor = useFrameProcessor(
    (frame) => {
      "worklet";

      if (plugin.state === "loaded") {
        runAtTargetFps(1, () => {
          "worklet";
          const resized = resize(frame, {
            scale: {
              width: 320,

              height: 320,
            },

            pixelFormat: "rgb",

            dataType: "float32",
          });
          const outputs = plugin.model.runSync([resized]);

          // const array: number[] = [];
          // for(let i = 0; i < 2100*5; i+=5) {
          //   if(outputs[0][i+1] > 0.5) {
          //     array.push(outputs[0][i+1] as number);
            
          // }
          
            
          // }
          console.log(decodeYoloOutput(outputs, 2100, 5).length);
          
        //console.log(outputs[0].slice(0, 10));
        
          

          // console.log(outputs[0], outputs[1]);
          //const newPose = mapToPose(outputs[0]);
          //console.log(newPose);
          //detectedPose.value = newPose;
        });
        //console.log(newPose);
      }
    },

    [plugin]
  ); // Use useImperativeHandle to expose functionalities to the parent component

  const format = useCameraFormat(device, [{ videoAspectRatio: 9 / 16 }]);

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
