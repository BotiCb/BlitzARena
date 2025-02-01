import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';

import { AppStackParamList } from '~/navigation/types';
import { GAME_ENDPOINTS } from '~/services/restApi/Endpoints';
import { apiClient } from '~/services/restApi/RestApiService';
import { CreateGameRequestDto } from '~/services/restApi/dto/request.dto';
import { CreateGameResponseDto } from '~/services/restApi/dto/response.dto';

const GameSetupScreen = () => {
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();
  const [maxPlayers, setMaxPlayers] = useState<number>(2);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleMaxPlayersChange = (delta: number) => {
    if (delta > 0) {
      if (maxPlayers < 10) {
        setMaxPlayers(maxPlayers + delta);
      }
    }
    if (delta < 0) {
      if (maxPlayers > 2) {
        setMaxPlayers(maxPlayers + delta);
      }
    }
  };

  const handleCreateGame = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const response: CreateGameResponseDto = (
        await apiClient.post(GAME_ENDPOINTS.CREATE, new CreateGameRequestDto(maxPlayers))
      ).data;
      navigation.navigate('GameStack', {
        gameId: response.gameId,
        userSessionId: response.sessionId,
      });
    } catch (err: any) {
      setError(err.response.data.message + 'please try again later');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <View>
      <Text>GameSetupScreen</Text>
      <Button title="Back to home" onPress={() => navigation.pop()} />
      <Text> Max players: {maxPlayers}</Text>
      <View>
        <Button title="+1" onPress={() => handleMaxPlayersChange(1)} />
        <Button title="-1" onPress={() => handleMaxPlayersChange(-1)} />
      </View>
      <Button title="Create Game" onPress={handleCreateGame} />
      {isLoading && <Text>Creating game...</Text>}
      {error && <Text>{error}</Text>}
    </View>
  );
};

export default GameSetupScreen;
