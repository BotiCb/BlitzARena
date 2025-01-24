import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AxiosResponse } from 'axios';
import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';

import { LobbyStackParamList } from '~/navigation/types';
import { LOBBY_ENDPOINTS } from '~/services/restApi/Endpoints';
import { apiClient } from '~/services/restApi/RestApiService';

const LobbySetupScreen = () => {
  const navigation = useNavigation<StackNavigationProp<LobbyStackParamList>>();
  const [maxPlayers, setMaxPlayers] = useState<number>(1);

  const handleMaxPlayersChange = (delta: number) => {
    if (delta > 0) {
      if (maxPlayers < 10) {
        setMaxPlayers(maxPlayers + delta);
      }
    }
    if (delta < 0) {
      if (maxPlayers > 1) {
        setMaxPlayers(maxPlayers + delta);
      }
    }
  };

  const handleCreateLobby = async () => {
    try {
      const response: AxiosResponse = await apiClient.post(LOBBY_ENDPOINTS.CREATE, { maxPlayers });
      console.log(response.status);
    } catch (err: any) {
      console.log(err.response);
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

      <Button title="Create Lobby" onPress={handleCreateLobby} />
    </View>
  );
};

export default LobbySetupScreen;
