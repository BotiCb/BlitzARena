import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

const SplashScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Loading...</Text>
    <ActivityIndicator size='large' color='#0000ff' />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20, marginBottom: 10 },
});

export default SplashScreen;
