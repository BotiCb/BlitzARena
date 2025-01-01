import CameraView from '@/components/CameraView';
import InMatchScreen from '@/screens/InMatchScreen';
import ModelTrainingScreen from '@/screens/ModelTrainingScreen';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View, Text, Button } from 'react-native';
import webSocketService from '@/services/websocket/websocket.service';
import * as ScreenOrientation from 'expo-screen-orientation';
import DeviceInfo from 'react-native-device-info';
export default function HomeScreen() {
  const [message, setMessage] = useState<string>('');  // Store received message
  const [connected, setConnected] = useState<boolean>(false);
  const [memoryUsage, setMemoryUsage] = useState<string>('');

  //set the device orientation to portrait
  

  useEffect(() => {
    // Connect to the WebSocket server when the component mounts
    webSocketService.connect('ws://192.168.1.69:8765'); // Using the echo WebSocket server for testing

    // Register a listener for incoming messages
    webSocketService.onMessage((data: string) => {
      setMessage(data); // Update message state when a message is received
    });
   
    

    // Cleanup when the component unmounts (close WebSocket)
    return () => {
      webSocketService.close();
    };
  }, []);


   useEffect(() => {
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };

    lockOrientation();

    return () => {
      // Reset orientation lock when component unmounts (optional)
      ScreenOrientation.unlockAsync();
    };
  }, []);

 

  useEffect(() => {
    //set the current memory usage every 1 second
    const interval = setInterval(() => {
      const logMemoryUsage = async () => {
        const totalMemory =  DeviceInfo.getTotalMemorySync();
        const usedMemory =  DeviceInfo.getUsedMemorySync();   // Used RAM
        const memoryUsagePercentage = ((usedMemory / totalMemory) * 100).toFixed(2);


        setMemoryUsage(`${memoryUsagePercentage}%` );
      };
      logMemoryUsage();
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);
 



  return (
    <View style={{ flex: 1 }}>
     <InMatchScreen />
      {/* <ModelTrainingScreen /> */}
      <Text>{memoryUsage}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
 
});
