import { NavigationProp, useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, Text } from 'react-native';

import { Button } from '~/components/Button';
import { AppStackParamList } from '~/navigation/types';

const LobbySetupScreen = () => {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  return (
    <View>
      <Text>LobbySetupScreen</Text>
      <Button title="Back to home" onPress={() => navigation.navigate('Home')} />
    </View>
  );
};

export default LobbySetupScreen;
