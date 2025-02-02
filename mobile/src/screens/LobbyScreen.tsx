import React from 'react';
import { View, Text } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { useGame } from '~/contexts/GameContext';

export const LobbyScreen = () => {
  const { gameId, players } = useGame();
  console.log('Players: ', players);
  return (
    <View>
      <QRCode value={'Game ID: ' + gameId} />
      <Text>Players: {players.map((player) => player.firstName).join(', ')}</Text>
    </View>
  );
};
