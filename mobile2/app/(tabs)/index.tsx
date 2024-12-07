import CameraView from '@/components/CameraView';
import InMatchScreen from '@/screens/InMatchScreen';
import ModelTrainingScreen from '@/screens/ModelTrainingScreen';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View, Text, Button } from 'react-native';
import webSocketService from '@/services/websocket/websocket.service';
export default function HomeScreen() {
  const [message, setMessage] = useState<string>('');  // Store received message
  const [connected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    // Connect to the WebSocket server when the component mounts
    webSocketService.connect('ws://192.168.68.226:8765'); // Using the echo WebSocket server for testing

    // Register a listener for incoming messages
    webSocketService.onMessage((data: string) => {
      setMessage(data); // Update message state when a message is received
    });
   

    // Cleanup when the component unmounts (close WebSocket)
    return () => {
      webSocketService.close();
    };
  }, []);

  const sendMessage = () => {
    webSocketService.sendMessage('Hello from React Native!'); // Send a message through the WebSocket connection
  };
  return (
    <View style={{ flex: 1 }}>
     {/* <InMatchScreen /> */}
      <ModelTrainingScreen />
      <Text>{message}</Text>
      <Button title="Send Message" onPress={sendMessage} />
    </View>
  );
}

const styles = StyleSheet.create({
 
});
