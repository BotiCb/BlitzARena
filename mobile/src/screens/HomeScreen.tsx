import { NavigationProp, useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, Button, Text, StyleSheet, ImageBackground } from 'react-native';
import AuthService from 'src/services/AuthService';
import { NeonButton } from '~/components/NeonButton';

import { useAuth } from '~/contexts/AuthContext';
import { AppStackParamList } from '~/navigation/types';
import { USER_ENDPOINTS } from '~/services/restApi/Endpoints';
import { apiClient } from '~/services/restApi/RestApiService';

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp<AppStackParamList, 'Home'>>();
  const { userInfo } = useAuth();


  return (
    <ImageBackground
      source={require('../../assets/ui/backgrounds/homescreen_original2.png')} // Make sure the image path is correct
      style={{ flex: 1 }}
      resizeMode="stretch">
      <View >
        {/* <NeonButton title="Logout" onPress={handleLogout} />
        <NeonButton title="GetProfile" onPress={handleGetProfile} /> */}
        <NeonButton
          title=""
          onPress={() => navigation.navigate('CreateGame')}
          style={{ marginTop: 413, width: 220, padding: 0, height: 83, marginLeft: 5 }}
        />
        <NeonButton
          title=""
          style={{ marginTop: 25,width: 220, padding: 0, height: 83, marginLeft: 5 }}
          onPress={() => navigation.navigate('JoinGame')}
        />
          <NeonButton
          title=""
          style={{ marginTop: 101, width: 5, padding: -10, height: 60, marginLeft: 340 }}
          onPress={() => navigation.navigate('Profile')}
        />
      </View>
    </ImageBackground>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({


});
