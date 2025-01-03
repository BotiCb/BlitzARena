import { View, StyleSheet, useWindowDimensions } from "react-native";
import Svg, {  Circle } from "react-native-svg";
export const Scope = () => {

const { width, height } = useWindowDimensions();
  return <View style={styles.container}>
    <Svg>
        <Circle cx={width/2} cy={height/2} r={5} fill={"blue"}/>
    </Svg>
  </View>;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "transparent",
        position: "absolute",
        height: "100%",
        width: "100%",
        borderColor: "red",
        borderWidth: 1,
    }
});