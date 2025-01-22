import React from "react";
import { View, Button, Text, StyleSheet } from "react-native";
import AuthService from "src/services/AuthService";

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const handleLogout = async () => {
    const success = await AuthService.logout();
    if (success) {
      navigation.replace("Login");
    }
  };

  return (
    <View >
      <Text style={styles.title}>Home Screen</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  error: {
    color: "red",
    marginBottom: 8,
  },
});