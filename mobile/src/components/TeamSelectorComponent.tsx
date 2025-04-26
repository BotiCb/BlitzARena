import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { NeonButton } from './NeonButton';

import { TEAM } from '~/utils/types/types';
import NeonText from '~/atoms/NeonText';

export interface TeamSelectorComponentProps {
  handleTeamSelection: (team: TEAM) => void;
}

export function TeamSelectorComponent({ handleTeamSelection }: TeamSelectorComponentProps) {
  return (
    <View style={styles.container}>
      <NeonText style={styles.text}>Choose your team</NeonText>
      <View style={styles.buttonContainer}>
        <NeonButton onPress={() => handleTeamSelection(TEAM.RED)} title="Red" color="red" />
        <NeonButton onPress={() => handleTeamSelection(TEAM.BLUE)} title="Blue" color="blue" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  text: {
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
});
