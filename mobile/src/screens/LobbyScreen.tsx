import React from 'react';
import { View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { PlayerListComponent } from '~/components/PlayerListComponent';
import { useGame } from '~/contexts/GameContext';

export const LobbyScreen = () => {
  const { gameId, players, areYouHost, setPlayerAsHost, userSessionId, onRemovePlayer } = useGame();

  return (
    <View>
      <QRCode value={'Game ID: ' + gameId} />
      <PlayerListComponent
        players={players}
        areYouHost={areYouHost}
        onSetAsHost={setPlayerAsHost}
        yourSessionId={userSessionId}
        onRemovePlayer={onRemovePlayer}

      />
    </View>
  );
};
