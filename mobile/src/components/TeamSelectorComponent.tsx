import React from 'react';
import { View, Button } from 'react-native';

import { TEAM } from '~/utils/types';

export interface TeamSelectorComponentProps {
  handleTeamSelection: (team: TEAM) => void;
}

export function TeamSelectorComponent({ handleTeamSelection }: TeamSelectorComponentProps) {
  return (
    <View>
      <Button onPress={() => handleTeamSelection(TEAM.RED)} title="Red" />
      <Button onPress={() => handleTeamSelection(TEAM.BLUE)} title="Blue" />
    </View>
  );
}
