import TrainingCameraView from "@/components/TraingCameraView";
import modelTrainingWebsocketService from "@/services/websocket/model-training.websocket.service";
import { TrainingImage } from "@/services/websocket/utils/types";
import { ObjectDetection } from "@/utils/types";
import { useEffect, useRef, useState } from "react";
import { View, Text, Button } from "react-native";

const ModelTrainingScreen = () => {
  const [takePhotos, setTakePhotos] = useState(false);
  const photoQueue = useRef<TrainingImage[]>([]); // Queue to store Base64 photos
  const isSending = useRef(false);
  const lastDetectionsRef = useRef<ObjectDetection[]>([]); // Prevent multiple send processes
  const [playerNumber, setPlayerNumber] = useState(0);

  // Add photo to the queue
  const handleImageCapture = (trainingImage: TrainingImage) => {
    photoQueue.current.push(trainingImage); // Add new photo to the queue
    sendPhotosToServer(); // Trigger sending process
  };

  useEffect(() => {
    const handleTrainingReady = () => {
      console.log("Received training_ready_for_player message");
      setTakePhotos(false);
    };
    modelTrainingWebsocketService.setTrainingReadyForPlayerEventListener(
      handleTrainingReady
    );
  }, []);

  // Function to send photos asynchronously
  const sendPhotosToServer = async () => {
    if (isSending.current || photoQueue.current.length === 0) return;

    isSending.current = true;

    while (photoQueue.current.length > 0) {
      const photo: TrainingImage | undefined = photoQueue.current.shift(); // Remove the first photo from the queue

      if (photo) {
        try {
          // Send the photo to the server via WebSocket

          modelTrainingWebsocketService.sendTrainingImage(photo);
        } catch (error) {
          console.error("Error sending photo:", error);
          photoQueue.current.unshift(photo); // Re-add the photo to the front of the queue
          break; // Exit the loop to retry later
        }
      }
    }

    isSending.current = false;
  };
  return (
    <View style={{ flex: 1 }}>
      <Text>ModelTrainingScreen Player: {playerNumber}</Text>
      {!takePhotos ? (
        <Button title="Take Photos" onPress={() => setTakePhotos(true)} />
      ) : (
        <Button
          title="Stop taking photos"
          onPress={() => setTakePhotos(false)}
        />
      )}
      <Button
        title="Next player "
        onPress={() => setPlayerNumber(playerNumber + 1)}
      />
      <Button
        title="Previous player "
        onPress={() => setPlayerNumber(playerNumber - 1)}
      />
      <Button
        title="Start training"
        onPress={() => modelTrainingWebsocketService.sendStartModelTraining()}
      />
      <TrainingCameraView
        takePhotos={takePhotos}
        handleImageCapture={handleImageCapture}
        lastDetectionsRef={lastDetectionsRef}
        playerNumber={playerNumber}
      />
    </View>
  );
};

export default ModelTrainingScreen;
