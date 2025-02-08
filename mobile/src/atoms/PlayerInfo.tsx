import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Menu, Divider, Provider } from 'react-native-paper';

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

  return (
    <Provider>
      <View style={styles.container}>
        {!player.isConnected && (
          <MaterialCommunityIcons name="power-plug-off" size={24} color="black" />
        )}

        <Image
          style={styles.image}
          source={
            player.photoUrl
              ? { uri: player.photoUrl }
              : require('../../assets/user/plain_profile_picture.jpg')
          }
        />

        <Text style={styles.text}>{player.firstName + ' ' + player.lastName}</Text>
        {isYou && <Text style={styles.text}>(You)</Text>}

        {player.isHost && <MaterialCommunityIcons name="crown" size={24} color="gold" />}

        {player.isReady ? (
          <Ionicons name="checkmark-circle" size={24} color="green" />
        ) : (
          <Ionicons name="checkmark-circle-outline" size={24} color="black" />
        )}

        {areYouHost && !isYou && (
          <View style={styles.menuContainer}>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <TouchableOpacity
                  onPress={() => setMenuVisible(!menuVisible)}
                  style={styles.menuButton}>
                  <MaterialCommunityIcons name="dots-vertical" size={24} color="black" />
                </TouchableOpacity>
              }>
              <Menu.Item onPress={onRemovePlayer} title="Remove Player" />
              <Divider />
              <Menu.Item onPress={onSetAsHost} title="Set as Host" />
            </Menu>
          </View>
        )}
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderWidth: 1,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    position: 'relative',
    minHeight: 50,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginHorizontal: 10,
    flexShrink: 0, // Ensure it doesn't shrink
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
    height: 'auto',
  },
  menuContainer: {
    position: 'relative',
    marginLeft: 'auto', // To align the menu button to the right
  },
  menuButton: {
    padding: 10,
  },
});
