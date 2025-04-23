import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';

import { PlayerInfo } from '~/atoms/PlayerInfo';
import { Player } from '~/utils/models';

interface PlayerListComponentProps {
  players: Player[];
  yourSessionId: string;
  areYouHost: boolean;
  onSetAsHost: (playerId: string) => void;
  onRemovePlayer: (playerId: string) => void;
  color?: string;
}

export const PlayerListComponent: React.FC<PlayerListComponentProps> = ({
  players,
  areYouHost,
  onSetAsHost,
  yourSessionId,
  onRemovePlayer,
  color,
}) => {
  return (
    <ScrollView style={styles.container}>
      {players.map((player) => (
        <View key={player.sessionID} style={styles.row}>
          <PlayerInfo
            player={player}
            areYouHost={areYouHost}
            onSetAsHost={() => onSetAsHost(player.sessionID)}
            onRemovePlayer={() => onRemovePlayer(player.sessionID)}
            isYou={player.sessionID === yourSessionId}
          />
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  row: {

    width: '100%',
    justifyContent: 'space-between', 
  },
});
