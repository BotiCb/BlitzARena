import React from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import AuthService from 'src/services/AuthService';

import { useAuth } from '~/contexts/AuthContext';
import { USER_ENDPOINTS } from '~/services/restApi/Endpoints';
import { apiClient } from '~/services/restApi/RestApiService';

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { userInfo } = useAuth();
  const handleLogout = async () => {
    await AuthService.logout();
  };

  const handleGetProfile = async () => {
    const response = await apiClient.get(USER_ENDPOINTS.GET_PROFILE);
    if (response.status === 200) {
      console.log(response.data);
    } else {
      console.log(response.status);
    }
  };

  return (
    <View>
      <Text style={styles.title}>{userInfo?.email}</Text>
      <Button title="Logout" onPress={handleLogout} />
      <Button title="GetProfile" onPress={handleGetProfile} />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  error: {
    color: 'red',
    marginBottom: 8,
  },
});
