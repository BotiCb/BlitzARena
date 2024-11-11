import TrainingCameraView from "@/components/TraingCameraView"
import { useEffect, useState } from "react"
import { View, Text, Button } from "react-native"

const ModelTrainingScreen = () => {
    const [takePhotos, setTakePhotos] = useState(false)
    const [capturedPhotos, setCapturedPhotos] = useState<any[]>([])
    const handleImageCapture = (image:any) => {
        setCapturedPhotos((prevImages) => [...prevImages, image]);
      };
      useEffect (() => {
        console.log(capturedPhotos)
      }, [takePhotos])
    return (
        <View style={{ flex: 1 }}>
            <Text>ModelTrainingScreen</Text>
            {!takePhotos ? 
            (<Button title="Take Photos" onPress={() => setTakePhotos(true)} />) : 
            (<Button title="Stop taking photos" onPress={() => setTakePhotos(false)} />)}
            <TrainingCameraView  takePhotos={takePhotos} handleImageCapture={handleImageCapture}/>
        </View>
    )
}

export default ModelTrainingScreen