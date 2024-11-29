import React, { forwardRef, useEffect, useRef } from "react";
import RNFS from "react-native-fs";
import { View, Text, StyleSheet, Platform } from "react-native";
import modelTrainingWebsocketService from "@/services/websocket/model-training.websocket.service";
import {
  Camera,
  useCameraDevices,
  useCameraPermission,
  useCameraFormat,
} from "react-native-vision-camera";

interface TrainingCameraViewProps {
  takePhotos: boolean;
  handleImageCapture: (image: any) => void;
}

const TrainingCameraView: React.FC<TrainingCameraViewProps> = ({
  takePhotos,
  handleImageCapture,
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
          handleImageCapture(base64Image);
        }
      }
    }, 1000); // Capture photo every 1 second

    return () => clearInterval(interval);

  }, [takePhotos, handleImageCapture, hasPermission]);


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
