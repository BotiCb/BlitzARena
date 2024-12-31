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
  useCameraFormat,
  runAtTargetFps,
  useSkiaFrameProcessor,
} from "react-native-vision-camera";

import * as useResizePlugin from "vision-camera-resize-plugin";

import {
  TensorflowModel,
  TensorflowPlugin,
  useTensorflowModel,
} from "react-native-fast-tflite";

import {
  decodeYoloPoseOutput,
  drawDetections,
  decodeYoloClassifyOutput,
} from "../utils/frame-procesing-utils";

import { Classification, Detection, ObjectDetection } from "../utils/types";

import { ISharedValue, useSharedValue, worklet, Worklets } from "react-native-worklets-core";
import { Skia } from "@shopify/react-native-skia";

function tensorToString(tensor: TensorflowModel["inputs"][number]): string {
  return `${tensor.dataType} [${tensor.shape}]`;
}

interface CameraViewProps {
  plugins: TensorflowPlugin[];
  detections: ISharedValue<Detection | null>
}

const CameraView = forwardRef<any, CameraViewProps>(({ plugins, detections }, ref) => {
  const device = useCameraDevices()[0]; // Using back camera as default

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

  const lastUpdateTime = useSharedValue<number>(Date.now());
  

  const frameProcessor = useFrameProcessor(
    (frame) => {
      "worklet";
     // frame.render();
     
      if (plugin.state === "loaded" && plugin2.state === "loaded") {

        runAtTargetFps(5, () => {
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
          const objDetection: ObjectDetection | null = decodeYoloPoseOutput(outputs, plugin.model.outputs[0].shape[2]);
          outputs.length=0;
          if(objDetection) {
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
            const classification: Classification = decodeYoloClassifyOutput(
              outputs2[0]
            )
            outputs2.length=0;
            // console.log(classification)
            detections.value = {
              objectDetection: objDetection,
              classification: classification
            };
            lastUpdateTime.value = Date.now();
           
          }

          
          // if (objDetection.length === 1) {
          //   // const resized2 = resize(frame, {
          //   //   scale: {
          //   //     width: plugin2.model.inputs[0].shape[1],
          //   //     height: plugin2.model.inputs[0].shape[2],
          //   //   },
          //   //   pixelFormat: "rgb",
          //   //  rotation: "270deg",

          //   //   dataType: "float32",
          //   //   crop: {
          //   //     x: detections.value[0].boundingBox.yc * frame.width,
          //   //     y: (1 - detections.value[0].boundingBox.xc) * frame.height,
          //   //     width: detections.value[0].boundingBox.h * frame.width,
          //   //     height: detections.value[0].boundingBox.w * frame.height,
          //   //   },
          //   // });

           
          // }

        
        });
      }

      // const currentTime = Date.now();
      // if (currentTime - lastUpdateTimeRef.current > 500) {
      //   lastDetectionsRef.current = [];
      // }
      //console.log(lastDetectionsRef.current);
      //console.log(detections.value);
          const currentTime = Date.now();
          if (currentTime - lastUpdateTime.value > 500) {
            detections.value = null;
          }
          // if(detections.value){
          //   drawDetections(frame, detections.value.objectDetection, paint);
          // }
      
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
