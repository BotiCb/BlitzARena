import { View } from "react-native"
import TensorCameraView from "../components/views/TensorCameraView"
import React from "react"
import CameraView from "../components/views/CameraView"
import { InbattleScreenProps } from "../utils/types"
  const InbattleScreen = () => {
    return (
        <View style={{ flex: 1 }}>
            
            
             {/* <CameraView /> */}
             <TensorCameraView />
            
            {/* <TensorCameraView sceletonModel={sceletonModel} isModelLoaded={isModelLoaded}/> */}
        </View>
    )
}

export default InbattleScreen;