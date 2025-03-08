import React from 'react';
import { View } from 'react-native';
import BigCountdownTimer from '~/atoms/BigCountdownTimer';
import { PlayerListComponent } from '~/components/PlayerListComponent';
import { useGame } from '~/contexts/GameContext';
import { useMatch } from '~/contexts/MatchContext';

export const InMatchWaitingForPlayersView = () => {
  const { players, areYouHost, setPlayerAsHost, userSessionId, onRemovePlayer } = useGame();

  const { matchPhaseEndsAt } = useMatch();
  return (
    <View>
      <PlayerListComponent
        players={players}
        areYouHost={areYouHost}
        onSetAsHost={setPlayerAsHost}
        yourSessionId={userSessionId}
        onRemovePlayer={onRemovePlayer}
        color="white"
      />
      {matchPhaseEndsAt && <BigCountdownTimer endsAt={matchPhaseEndsAt} />}
    </View>
  );
};
