import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';

import { LobbyStackParamList } from '~/navigation/types';

const LobbySetupScreen = () => {
  const navigation = useNavigation<StackNavigationProp<LobbyStackParamList>>();
  const [maxPlayers, setMaxPlayers] = useState(0);

  const handleMaxPlayersChange = (delta: number) => {
    if (delta > 0) {
      if (maxPlayers < 10) {
        setMaxPlayers(maxPlayers + delta);
      }
    }
    if (delta < 0) {
      if (maxPlayers > 0) {
        setMaxPlayers(maxPlayers + delta);
      }
    }
  };
  return (
    <View>
      <Text>LobbySetupScreen</Text>
      <Button title="Back to home" onPress={() => navigation.pop()} />
      <Text> Max players: {maxPlayers}</Text>
      <View>
        <Button title="+1" onPress={() => handleMaxPlayersChange(1)} />
        <Button title="-1" onPress={() => handleMaxPlayersChange(-1)} />
      </View>

      <Button title="Create Lobby" onPress={() => navigation.navigate('CreateLobby')} />
    </View>
  );
};

export default LobbySetupScreen;
