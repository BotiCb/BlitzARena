import React from 'react';
import { View, Text } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { useGame } from '~/contexts/GameContext';

export const LobbyScreen = () => {
  const { gameId, userSessionId } = useGame();
  return (
    <View>
      <QRCode value={'Game ID: ' + gameId} />
    </View>
  );
};
