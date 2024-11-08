import React from "react"
import { Dimensions, View, StyleSheet } from "react-native"
import { Circle, Svg} from "react-native-svg"

export const Scope = () => {
    const { width, height } = Dimensions.get("window");
    const centerpointX = width / 2;
    const centerpointY = height / 2;
    return (
    <View style={styles.container}>
        <Svg>
            <Circle cx={centerpointX} cy={centerpointY} r={10} fill={'red'}/>
        </Svg>
    </View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
    },
})