import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { View, Text, Button, ImageBackground } from 'react-native';
import { NeonButton } from '~/atoms/NeonButton';

import { AppStackParamList } from '~/navigation/types';
import { GAME_ENDPOINTS } from '~/services/restApi/Endpoints';
import { apiClient } from '~/services/restApi/RestApiService';
import { CreateGameRequestDto } from '~/services/restApi/dto/request.dto';
import { CreateGameResponseDto } from '~/services/restApi/dto/response.dto';

const GameSetupScreen = () => {
  const navigation = useNavigation<StackNavigationProp<AppStackParamList, 'CreateGame'>>();
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
    <ImageBackground
      source={require('../../assets/ui/backgrounds/background.png')} // Make sure the image path is correct
      style={{ flex: 1 }}
      resizeMode="stretch">
      <View>
        <Text>GameSetupScreen</Text>
        <NeonButton title="Back to home" onPress={() => navigation.pop()} />
        <Text> Max players: {maxPlayers}</Text>
        <View>
          <NeonButton title="+1" onPress={() => handleMaxPlayersChange(1)} />
          <NeonButton title="-1" onPress={() => handleMaxPlayersChange(-1)} />
        </View>
        <NeonButton title="Create Game" onPress={handleCreateGame} />
        {isLoading && <Text>Creating game...</Text>}
        {error && <Text>{error}</Text>}
      </View>
    </ImageBackground>
  );
};

export default GameSetupScreen;
