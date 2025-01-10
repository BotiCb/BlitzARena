import TrainingCameraView from "@/views/TraingCameraView";
import modelTrainingWebsocketService from "@/services/websocket/model-training.websocket.service";
import { TrainingImage } from "@/utils/types/websocket-types";
import { ObjectDetection } from "@/utils/types/detection-types";
import { useEffect, useRef, useState } from "react";
import { View, Text, Button, Platform } from "react-native";
import { useTensorflowModel } from "react-native-fast-tflite";

const ModelTrainingScreen = () => {
  const [takePhotos, setTakePhotos] = useState(false);
  const lastDetectionsRef = useRef<ObjectDetection[]>([]); 
  const [playerNumber, setPlayerNumber] = useState(0);

  const handleImageCapture = (trainingImage: TrainingImage) => {
    modelTrainingWebsocketService.sendPhoto(trainingImage);
  };

  useEffect(() => {
    const handleTrainingReady = () => {
      console.log("Received training_ready_for_player message");
      setTakePhotos(false);
    };
    modelTrainingWebsocketService.setTrainingReadyForPlayerEventListener(handleTrainingReady);
  }, []);

  const delegate = Platform.OS === "ios" ? "core-ml" : undefined;

  const plugin = useTensorflowModel(
    require("../assets/models/yolo11n-pose_saved_model/yolo11n-pose_integer_quant.tflite"),
    delegate,
  );


  return (
    <View style={{ flex: 1 }}>
      <Text>ModelTrainingScreen Player: {playerNumber}</Text>
      {!takePhotos ? (
        <Button title="Take Photos" onPress={() => setTakePhotos(true)} />
      ) : (
        <Button title="Stop taking photos" onPress={() => setTakePhotos(false)} />
      )}
      <Button title="Next player " onPress={() => setPlayerNumber(playerNumber + 1)} />
      <Button title="Previous player " onPress={() => setPlayerNumber(playerNumber - 1)} />
      <Button title="Start training" onPress={() => modelTrainingWebsocketService.sendStartModelTraining()} />
      <TrainingCameraView
        takePhotos={takePhotos}
        handleImageCapture={handleImageCapture}
        playerNumber={playerNumber}
        plugin={plugin}
      />
    </View>
  );
};

export default ModelTrainingScreen;
