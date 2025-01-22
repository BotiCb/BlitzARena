import React from "react";
import { useState, useEffect } from "react";
import { View, Text } from "react-native";


export default function HomeScreen() {


    // const [message, setMessage] = useState<string>(""); // Store received message
    
    //   //set the device orientation to portrait
    
    //   useEffect(() => {
    //     // Connect to the WebSocket server when the component mounts
    //     webSocketService.connect("ws://192.168.1.33:8765"); // Using the echo WebSocket server for testing
    
    //     // Register a listener for incoming messages
    //     webSocketService.onMessage((data: string) => {
    //       setMessage(data); // Update message state when a message is received
    //     });
    
    //     // Cleanup when the component unmounts (close WebSocket)
    //     return () => {
    //       webSocketService.close();
    //     };
    //   }, []);
    
    return <View>
        <Text>Home</Text>
    </View>;
}