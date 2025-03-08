import React from 'react';
import { View } from 'react-native';
import BigCountdownTimer from '~/atoms/BigCountdownTimer';
import InBattlePlayerTag from '~/atoms/InBattlePlayerTag';
import { PlayerListComponent } from '~/components/PlayerListComponent';
import { useGame } from '~/contexts/GameContext';
import { useMatchWaitingForPlayers } from '~/hooks/useMatchWaitingForPlayers';


const InMatchWaitingForPlayersView = () => {

  const { players, areYouHost, setPlayerAsHost, userSessionId, onRemovePlayer } = useGame();

  return (
    <View>
        <InBattlePlayerTag />
    </View>
  );
};

export default InMatchWaitingForPlayersView;