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
import modelTrainingWebsocketService from "@/services/websocket/model-training.websocket.service";

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
    require("../assets/models/best_float32.tflite"),
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



  // useImperativeHandle(
  //   ref,
  //   () => ({
  //     getPose: () => {
  //       return detectedPose.value;
  //     },
  //   }),
  //   []
  // );
  const paint = Skia.Paint();
  paint.setColor(Skia.Color("red"));
  paint.setStrokeWidth(3);
  const colors: string[] = ["red", "green", "blue", "yellow"];


  const detections = useSharedValue<Detection[]>([]);
  function getKeyOfMaxValue(array: any): number {
    "worklet";
    let maxIndex = 0;
    let maxValue = array[0];

    for (let i = 1; i < array.length; i++) {
      if (array[i] > maxValue) {
        maxValue = array[i];
        maxIndex = i;
      }
    }

    return maxIndex; // Return the index of the max value
  }

  const frameProcessor = useFrameProcessor(
    (frame) => {
      "worklet";
      //frame.render();
      if (plugin.state === "loaded" && plugin2.state === "loaded") {
        runAtTargetFps(
          15, () => {
          "worklet";
          const resized = resize(frame, {
            scale: {
              width: plugin.model.inputs[0].shape[1],
              height: plugin.model.inputs[0].shape[2],
            },
            pixelFormat: "rgb",
            rotation: "90deg",
            dataType: "float32",
            crop: { x: 0, y: 0, width: frame.width, height: frame.height },
          });
         
          
          
          const outputs = plugin.model.runSync([resized]);
          detections.value = decodeYoloPoseOutput(outputs, 2100, 5);

          if (Object.values(detections.value).length === 1) {
            // const resized2 = resize(frame, {
            //   scale: {
            //     width: plugin2.model.inputs[0].shape[1],
            //     height: plugin2.model.inputs[0].shape[2],
            //   },
            //   pixelFormat: "rgb",
            //  rotation: "270deg",

            //   dataType: "float32",
            //   crop: {
            //     x: detections.value[0].boundingBox.yc * frame.width,
            //     y: (1 - detections.value[0].boundingBox.xc) * frame.height,
            //     width: detections.value[0].boundingBox.h * frame.width,
            //     height: detections.value[0].boundingBox.w * frame.height,
            //   },
            // });

            const resized3 = resize(frame, {
              scale: {
                width: plugin2.model.inputs[0].shape[1],
                height: plugin2.model.inputs[0].shape[2],
              },
              pixelFormat: "rgb",
             rotation: "90deg",
              dataType: "float32",

              crop: { x: 0, y: 0, width: frame.width, height: frame.height },
            });

            const outputs2 = plugin2.model.runSync([resized3]);
            console.log(outputs2);
            console.log(getKeyOfMaxValue(outputs2[0]));
            paint.setColor(Skia.Color(colors[getKeyOfMaxValue(outputs2[0])]));
          }

          // if (detections.value.length > 0) {
          //   lastDetectionsRef.current = detections.value;
          //   lastUpdateTimeRef.current = Date.now();
          //   //console.log(detections[0].keypoints[0]);
          // }
        });
      }

      // const currentTime = Date.now();
      // if (currentTime - lastUpdateTimeRef.current > 500) {
      //   lastDetectionsRef.current = [];
      // }
      //console.log(lastDetectionsRef.current);
      //drawDetections(frame, detections.value, paint);
    },
    [plugin, plugin2, detections]
  );

  const format = useCameraFormat(device, [
    {
      videoResolution: { height: 1500, width: 1500 * (16 / 9) },
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
