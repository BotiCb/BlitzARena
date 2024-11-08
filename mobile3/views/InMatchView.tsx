import { View, Text } from "react-native"
import React from "react"
import { Camera } from "expo-camera";
import CameraComponent from "@/components/Camera";
import { Scope } from "@/components/Scope";

  const InMatchView = () => {
    return (
        <View style={{ flex: 1 }}>
            <Text>InMatchView</Text>
            
             <CameraComponent/>
             
           
            
           
        </View>
    )
}

export default InMatchView;