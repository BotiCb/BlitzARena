import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Camera, useCameraDevices, useCameraPermission, useFrameProcessor } from "react-native-vision-camera";
import {TensorflowModel, useTensorflowModel} from 'react-native-fast-tflite';


const CameraView = () => {
    const device = useCameraDevices()[0]; // Using back camera as default
    const { hasPermission } = useCameraPermission();
    
    if (!device || !hasPermission) {
        return (
            <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>Camera permission is required.</Text>
            </View>
        );
    }
    const frameProcessor = useFrameProcessor((frame) => {
        'worklet'
        console.log(`Frame: ${frame.width}x${frame.height} (${frame.pixelFormat})`)
      }, [])
    return (
        <View style={styles.container}>
            <Camera
                style={StyleSheet.absoluteFill} // Fills the entire screen
                device={device}
                isActive={true}
                frameProcessor={frameProcessor}
                
            />
        </View>
    );
};

export default CameraView;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    permissionText: {
        fontSize: 16,
        color: 'gray',
    },
});
