import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  ActivityIndicator,
  Platform,
  Text,
  Button
} from "react-native";
import { cameraWithTensors } from "@tensorflow/tfjs-react-native";
import { useCameraPermissions } from "expo-camera";
import { Camera } from "expo-camera/legacy"; 
import Svg, { Circle } from "react-native-svg";
import * as Posenet from "@tensorflow-models/posenet";
import * as tf from "@tensorflow/tfjs";

const TensorCamera = cameraWithTensors(Camera);
const { width: windowWidth, height: windowHeight } = Dimensions.get("window");

const tensorDims = { width: 224, height: 224 };
const textureDims =
  Platform.OS === "ios"
    ? { width: 1080, height: 1920 }
    : { width: 1920, height: 1600 };

const InbattleScreen = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [model, setModel] = useState<Posenet.PoseNet | null>(null);
  const [pose, setPose] = useState<Posenet.Pose | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState<boolean>(false);
  const cameraRef = useRef<any>(null); // Use any for the ref

  useEffect(() => {
    const loadModel = async () => {
      await tf.ready();
      try {
        const posenetModel = await Posenet.load({
          inputResolution: tensorDims,
          architecture: "MobileNetV1",
          outputStride: 16,
          multiplier: 0.75,
        });
        setModel(posenetModel);
        setIsModelLoaded(true);
      } catch (error) {
        console.error("Model failed to load:", error);
      }
    };
    loadModel();
  }, []);

  const handleCameraStream = (images: any) => {
    const loop = async () => {
      try {
        if (model) {
          const nextImageTensor = images.next().value;
          if (nextImageTensor) {
            const poseEstimation = await model.estimateSinglePose(
              nextImageTensor,
            );
            setPose(poseEstimation);
            tf.dispose(nextImageTensor);
          } else {
            console.warn("No image tensor available");
          }
        }

        
      } catch (error) {
        console.error("Error in handleCameraStream:", error); 
      }

      requestAnimationFrame(loop);
    };
    loop();
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isModelLoaded ? (
        <>
          <TensorCamera
            ref={cameraRef}
            style={styles.camera}
            cameraTextureHeight={textureDims.height}
            cameraTextureWidth={textureDims.width}
            useCustomShadersToResize={false}
            resizeWidth={tensorDims.width}
            resizeHeight={tensorDims.height}
            resizeDepth={3}
            autorender={false}
            onReady={handleCameraStream}
          />
          {pose && (
           <Svg style={styles.svg}>
           {pose.keypoints.map((keypoint, index) => {
             // Calculate scale factors for x and y
             const scaleX = windowWidth / tensorDims.width;
             const scaleY = windowHeight / tensorDims.height;
         
             // Apply scale factors to keypoint positions
             const x = windowWidth - keypoint.position.x * scaleX;
             const y =  keypoint.position.y * scaleY;
         
             return (
               keypoint.score > 0.5 && (
                 <Circle
                   key={index}
                   cx={x} // Use scaled x position
                   cy={y} // Use scaled y position
                   r="5"
                   fill="red"
                 />
               )
             );
           })}
         </Svg>
          )}
        </>
      ) : (
        <ActivityIndicator size="large" color="#0000ff" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  svg: {
    position: "absolute",
    top: 0,
    left: 0,
    width: windowWidth,
    height: windowHeight,
  },
});

export default InbattleScreen;