import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PlayerInfo } from '~/atoms/PlayerInfo';
import { Player } from '~/utils/models';

interface PlayerListComponentProps {
  players: Player[];
  yourSessionId: string;
  areYouHost: boolean;
  onSetAsHost: (playerId: string) => void;
  onRemovePlayer: (playerId: string) => void;
}

export const PlayerListComponent: React.FC<PlayerListComponentProps> = ({
  players,
  areYouHost,
  onSetAsHost,
  yourSessionId,
  onRemovePlayer,
}) => {
  return (
    <View style={styles.container}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12, // Increased vertical padding
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    width: '100%',
    justifyContent: 'space-between', // Ensures no overlap
    minHeight: 70,
  },
});
