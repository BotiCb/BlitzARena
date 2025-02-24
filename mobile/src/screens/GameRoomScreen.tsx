import React from 'react';
import { View, Button, Text } from 'react-native';

import SplashScreen from './SplashScreen';

import { PlayerListComponent } from '~/components/PlayerListComponent';
import { TeamSelectorComponent } from '~/components/TeamSelectorComponent';
import { useGame } from '~/contexts/GameContext';
import { useGameRoom } from '~/hooks/useGameRoom';
import { TEAM } from '~/utils/types';

export const GamerRoomScreen = () => {
  const {
    players,
    areYouHost,
    setPlayerAsHost,
    userSessionId,
    onRemovePlayer,
    onStartNextGamePhase,
    model,
    trainingProgress,
    isPhaseInfosNeeded,
  } = useGame();

  const { handleReadyPress, ready, isEveryOneReady, handleTeamSelection } = useGameRoom();

  if (isPhaseInfosNeeded) {
    return <SplashScreen />;
  }
  return (
    <View>
      {trainingProgress !== null && <Text>Training Progress: {trainingProgress}</Text>}
      <TeamSelectorComponent handleTeamSelection={handleTeamSelection} />
      <Text>No team</Text>
      <PlayerListComponent
        players={players.filter((player) => !player.team)}
        areYouHost={areYouHost}
        onSetAsHost={setPlayerAsHost}
        yourSessionId={userSessionId}
        onRemovePlayer={onRemovePlayer}
      />
      <Text>Red team</Text>
      <PlayerListComponent
        players={players.filter((player) => player.team === TEAM.RED)}
        areYouHost={areYouHost}
        onSetAsHost={setPlayerAsHost}
        yourSessionId={userSessionId}
        onRemovePlayer={onRemovePlayer}
      />
      <Text>Blue team</Text>
      <PlayerListComponent
        players={players .filter((player) => player.team === TEAM.BLUE)}
        areYouHost={areYouHost}
        onSetAsHost={setPlayerAsHost}
        yourSessionId={userSessionId}
        onRemovePlayer={onRemovePlayer}
      />
      {model && <Button onPress={handleReadyPress} title={ready ? 'Not Ready' : 'Ready'} />}
      {isEveryOneReady && areYouHost && (
        <Button title="Start Game" onPress={onStartNextGamePhase} />
      )}
    </View>
  );
};
