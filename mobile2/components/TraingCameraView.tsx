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
  useFrameProcessor,
} from "react-native-vision-camera";
import { Skia } from "@shopify/react-native-skia";
import { ObjectDetection } from "@/utils/types";
import { TensorflowModel, useTensorflowModel } from "react-native-fast-tflite";
import {
  decodeYoloPoseOutput,
  drawDetections,
} from "@/utils/frame-procesing-utils";
import { TrainingImage } from "@/services/websocket/utils/types";
import { useSharedValue } from "react-native-worklets-core";
import ImageEditor from "@react-native-community/image-editor";
import { ImageCropData } from "@react-native-community/image-editor/lib/typescript/src/types";

interface TrainingCameraViewProps {
  takePhotos: boolean;
  handleImageCapture: (trainingImage: TrainingImage) => void;
  lastDetectionsRef: React.MutableRefObject<ObjectDetection[]>;
  playerNumber: number;
}
function tensorToString(tensor: TensorflowModel["inputs"][number]): string {
  return `${tensor.dataType} [${tensor.shape}]`;
}

const TrainingCameraView: React.FC<TrainingCameraViewProps> = ({
  takePhotos,
  handleImageCapture,
  lastDetectionsRef,
  playerNumber,
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
    if (!takePhotos || !hasPermission) return;

    const interval = setInterval(async () => {
      if (camera.current && detections.value) {
        while (Date.now() - lastUpdateTime.value > 10) {
          // console.log(Date.now() - lastUpdateTime.value + " delaying");
          // Wait for 10ms before taking the photo
          await new Promise((resolve) => setTimeout(resolve, 3));
          if (!detections.value || !takePhotos) {
            console.log("Skipping photo");
            return;
          }
        }
        const photoPromise = camera.current.takePhoto();
        console.log(Date.now() - lastUpdateTime.value);
        const photo = await photoPromise;
        if (photo) {
          try {
            console.log(photo.width, photo.height);
            let cropOptions: ImageCropData;
            if (photo.height > photo.width) {
              cropOptions = {
                offset: {
                  x: (1 - detections.value.boundingBox.y1) * photo.width,
                  y: detections.value.boundingBox.x1 * photo.height,
                },
                size: {
                  width: detections.value.boundingBox.w * photo.width,
                  height: detections.value.boundingBox.h * photo.height,
                },
                quality: 1.0,
              };
            } else {
              cropOptions = {
                offset: {
                  x: (1 - detections.value.boundingBox.y1) * photo.height,
                  y: detections.value.boundingBox.x1 * photo.width,
                },
                size: {
                  width: detections.value.boundingBox.w * photo.height,
                  height: detections.value.boundingBox.h * photo.width,
                },
                quality: 1.0,
              };
            }
            const croppedPhoto = await ImageEditor.cropImage(
              "file://" + photo.path,
              cropOptions
            );

            const base64Image = await RNFS.readFile(croppedPhoto.uri, "base64");
            //delete the photo file after using it
            await RNFS.unlink(croppedPhoto.uri);
            await RNFS.unlink(photo.path);
            const trainingImage: TrainingImage = {
              photo: base64Image,
              detectedPlayer: playerNumber.toString(),
            };

            handleImageCapture(trainingImage);
          } catch (error) {
            console.error("Error cropping image:", error);
          }
        }
      }
    }, 500); // Capture photo every 1 second

    return () => clearInterval(interval);
  }, [takePhotos, handleImageCapture, hasPermission]);
  const paint = Skia.Paint();
  paint.setColor(Skia.Color("red"));
  paint.setStrokeWidth(3);

  const paint2 = Skia.Paint();
  paint2.setColor(Skia.Color("green"));
  paint2.setStrokeWidth(3);

  const { resize } = useResizePlugin.createResizePlugin();
  // Ref for detections

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

  const detections = useSharedValue<ObjectDetection | null>(null);

  const frameProcessor = useSkiaFrameProcessor(
    (frame) => {
      "worklet";
      frame.render();
      if (plugin.state === "loaded") {
        runAtTargetFps(5, () => {
          "worklet";
          const resized = resize(frame, {
            scale: { width: plugin.model.inputs[0].shape[1], height: plugin.model.inputs[0].shape[2] },
            pixelFormat: "rgb",
            rotation: "90deg",
            dataType: "float32",
            crop: { x: 0, y: 0, width: frame.width, height: frame.height },
          });

          const outputs = plugin.model.runSync([resized]);

         const objDetection: ObjectDetection | null = decodeYoloPoseOutput(outputs, plugin.model.outputs[0].shape[2]);
        if(objDetection){
          detections.value = objDetection;
          lastUpdateTime.value = Date.now();
        }
        });
      }

      const currentTime = Date.now();
      if (currentTime - lastUpdateTime.value > 500) {
        detections.value = null;
      }
      if(detections.value){
        drawDetections(frame, detections.value, paint);
      }
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
        outputOrientation="preview"
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
