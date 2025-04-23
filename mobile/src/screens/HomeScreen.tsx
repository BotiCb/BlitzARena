import { NavigationProp, useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, Button, Text, StyleSheet, ImageBackground } from 'react-native';
import AuthService from 'src/services/AuthService';
import { NeonButton } from '~/atoms/NeonButton';

import { useAuth } from '~/contexts/AuthContext';
import { AppStackParamList } from '~/navigation/types';
import { USER_ENDPOINTS } from '~/services/restApi/Endpoints';
import { apiClient } from '~/services/restApi/RestApiService';

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp<AppStackParamList, 'Home'>>();
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
    <ImageBackground
      source={require('../../assets/ui/backgrounds/homescreen_original.png')} // Make sure the image path is correct
      style={{ flex: 1 }}
      resizeMode="stretch">
      <View>
        <NeonButton title="Logout" onPress={handleLogout} />
        <NeonButton title="GetProfile" onPress={handleGetProfile} />
        <NeonButton title="Host Game" onPress={() => navigation.navigate('CreateGame')} />
        <NeonButton title="Join Game" onPress={() => navigation.navigate('JoinGame')} />
      </View>
    </ImageBackground>
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
  mapContainer: {
    flex: 1,
    width: '100%',
    marginTop: 16,
    height: '100%',
  },
});
