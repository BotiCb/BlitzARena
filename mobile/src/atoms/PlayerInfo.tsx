import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Menu, Divider, Provider } from 'react-native-paper';
import { useGame } from '~/contexts/GameContext';

import { Player } from '~/utils/models';

interface PlayerInfoProps {
  player: Player;
  areYouHost: boolean;
  isYou: boolean;
  onSetAsHost: () => void;
  onRemovePlayer: () => void;
}

export const PlayerInfo: React.FC<PlayerInfoProps> = ({
  player,
  areYouHost,
  onSetAsHost,
  onRemovePlayer,
  isYou,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const { gamePhase } = useGame();

  const playerName = player.firstName && player.lastName
    ? (player.firstName + ' ' + player.lastName).length > 10
      ? (player.firstName + ' ' + player.lastName).slice(0, 10) + '...'
      : player.firstName + ' ' + player.lastName
    : 'Connecting...';

  return (
    <View style={styles.container}>
      <Image
        style={styles.image}
        source={
          player.photoUrl
            ? { uri: player.photoUrl }
            : require('../../assets/user/plain_profile_picture.jpg')
        }
      />

      <Text style={[styles.text, { paddingLeft: 75 }]}>
        {playerName}
      </Text>
      {isYou && <Text style={styles.text}>(You)</Text>}
      {gamePhase === 'match' && (
        <Text style={styles.text}>
          {player.kills} / {player.deaths}
        </Text>
      )}

      {player.isHost && <MaterialCommunityIcons name="crown" size={24} color="gold" />}

      {player.isReady ? (
        <Ionicons name="checkmark-circle" size={24} color="#33bea8" />
      ) : (
        <Ionicons name="checkmark-circle-outline" size={24} />
      )}
      {!player.isConnected && <MaterialCommunityIcons name="power-plug-off" size={24} />}

      {areYouHost && !isYou && (
        <View style={styles.menuContainer}>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableOpacity onPress={() => setMenuVisible(true)}>
                <MaterialCommunityIcons 
                  name="dots-vertical" 
                  size={24} 
                  style={styles.menuButton} 
                />
              </TouchableOpacity>
            }
            style={styles.menuStyle} 
          >
            <Menu.Item onPress={onRemovePlayer} title="Remove Player" />
            <Divider />
            <Menu.Item onPress={onSetAsHost} title="Set as Host" />
          </Menu>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '98%',
    paddingHorizontal: 10,
    position: 'relative',
    minHeight: 70,
    backgroundColor: '#d2d7d9',
    borderRadius: 10,
    marginVertical: 5,
    marginHorizontal: 'auto',
  },
  image: {
    width: 74,
    height: 74,
    borderRadius: 100,
    marginHorizontal: 7,
    borderWidth: 1.5,
    borderColor: '#4bb0c2',
    position: 'absolute',
  },
  text: {
    fontFamily: 'Poppins_500Medium_Italic',
    fontSize: 26,
    color: '#30687d',
    letterSpacing: -1.1,
      justifyContent: 'center',
  },
  menuContainer: {
    position: 'relative',
    marginLeft: 'auto', // To align the menu button to the right
  },
  menuButton: {
    padding: 10,
    color: '#30687d',
  },
  menuStyle: {
    marginTop: 40, // Adjust this value based on your layout
    marginRight: 10,
  },
});
