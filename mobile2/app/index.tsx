import InMatchScreen from "@/screens/InMatchScreen";
import ModelTrainingScreen from "@/screens/ModelTrainingScreen";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, View, Text, Button } from "react-native";
import webSocketService from "@/services/websocket/websocket.service";
import { SplashScreen } from "./SplashScreen";
import { HomeScreen } from "../../mobile/src/screens/home";
export default function App() {
  // useEffect(() => {
  //     const timeoutId = setTimeout(() => {
  //       router.replace('/HomeScreen');
  //     }, 2000);

  //     return () => clearTimeout(timeoutId);
  //   }, []);

  return (
    <View style={{ flex: 1 }}>
      {/* <InMatchScreen /> */}
      {/* <ModelTrainingScreen /> */}
      {/* <HomeScreen /> */}
    </View>
  );
}

const styles = StyleSheet.create({});
