import React, { useRef, useEffect, useState } from "react";
import { ActivityIndicator, Button, StyleSheet, View, Text } from "react-native";
import { CameraView } from "expo-camera";
import * as bodyPix from "@tensorflow-models/body-pix";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";
import "@tensorflow/tfjs-core";
import { convert } from "base64-to-tensor";
import { imageToTensor3D, mapBodyPixPartIdToName } from "@/utils/imageProcessing";
import { Scope } from "./Scope";
import { CameraConstants } from "@/utils/cameraConstants";

export default function CameraComponent() {
  const [model, setModel] = useState<bodyPix.BodyPix | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState<boolean>(false);
  const cameraRef = useRef<CameraView>(null);
  const [bodyPart, setBodyPart] = useState<string>("");
  const middleX = Math.floor(CameraConstants.INPUT_WIDTH / 2);
  const middleY = Math.floor(CameraConstants.INPUT_HEIGHT / 2); 
  const middlePixelIndex = middleY * CameraConstants.INPUT_WIDTH + middleX;
  const processImage = async (image: any) => {
    try {
      
      // Decode the base64 image string into a tensor
      const imgTensor = await imageToTensor3D(image);
      console.log(imgTensor);
      if (model && imgTensor) {
        // Run the segmentation on the decoded image tensor
        const startTime = performance.now();
        const segmentation = await model.segmentPersonParts(imgTensor);
        const endTime = performance.now();
        console.log(`Segmentation took ${endTime - startTime}ms`);
        setBodyPart(mapBodyPixPartIdToName(segmentation.data[middlePixelIndex]));
        console.log("segmentation :",segmentation.data.filter((x) => x > 0));
      }
    } catch (error) {
      console.error("Error in processing the image:", error);
    }
  };

  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready();
        const bodypixModel = await bodyPix.load({
          architecture: "MobileNetV1",
          outputStride: 16,
          multiplier: 0.5,
          quantBytes: 2
        });
        setModel(bodypixModel);
        setIsModelLoaded(true);
        console.log("model loaded");
      } catch (error) {
        console.error("Model failed to load:", error);
      }
    };
    loadModel();
  }, []);
  const takePic = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ // Adjust quality as needed
      });
      //console.log(photo);
      if (photo) {
        processImage(photo);
      }
    }
  };

  return (
    <View style={styles.container}>
      {isModelLoaded ? (
        <CameraView
          style={styles.camera}
          ratio="16:9"
          ref={cameraRef}
          animateShutter={false}
        />
        
      ) : (
        <ActivityIndicator color={"blue"} size="large" />
      )}
      <Scope/>

      <Button title="Take Picture" onPress={() => takePic()} />
      <Text style={styles.bodyPartText}>{bodyPart}</Text>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  bodyPartText: {
    color: "red",
  }
});
