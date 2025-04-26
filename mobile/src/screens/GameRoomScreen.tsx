import React from 'react';
import { Button, ImageBackground, Text } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import SplashScreen from './SplashScreen';

import { MapComponent } from '~/components/MapComponent';
import { PlayerListComponent } from '~/components/PlayerListComponent';
import { TeamSelectorComponent } from '~/components/TeamSelectorComponent';
import { useGame } from '~/contexts/GameContext';
import { useGameRoom } from '~/hooks/useGameRoom';
import { TEAM } from '~/utils/types/types';
import { ProgressBar } from '~/components/ProgressBar';
import { NeonButton } from '~/components/NeonButton';
import NeonText from '~/atoms/NeonText';

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

  const {
    handleReadyPress,
    isEveryOneReady,
    handleTeamSelection,
    gameArea,
    onGameAreaChange,
    ready,
  } = useGameRoom();

  if (isPhaseInfosNeeded) {
    return <SplashScreen />;
  }
  return (
    <ImageBackground
      source={require('../../assets/ui/backgrounds/background.png')} // Make sure the image path is correct
      style={{ flex: 1 }}
      resizeMode="cover">
      <ScrollView>
        {trainingProgress !== null && <ProgressBar progress={trainingProgress} label="Training" />}
        <TeamSelectorComponent handleTeamSelection={handleTeamSelection} />

        {players.some((player) => player.team === TEAM.RED) && (
          <>
            <NeonText style={{ color: 'red' }}>Red team</NeonText>
            <PlayerListComponent
              players={players.filter((player) => player.team === TEAM.RED)}
              areYouHost={areYouHost}
              onSetAsHost={setPlayerAsHost}
              yourSessionId={userSessionId}
              onRemovePlayer={onRemovePlayer}
            />
          </>
        )}

        {players.some((player) => player.team === TEAM.BLUE) && (
          <>
            <NeonText style={{ color: 'blue' }}>Blue team</NeonText>
            <PlayerListComponent
              players={players.filter((player) => player.team === TEAM.BLUE)}
              areYouHost={areYouHost}
              onSetAsHost={setPlayerAsHost}
              yourSessionId={userSessionId}
              onRemovePlayer={onRemovePlayer}
            />
          </>
        )}

        <MapComponent
          gameArea={gameArea}
          readonly={!areYouHost}
          onGameAreaChange={onGameAreaChange}
        />
      </ScrollView>
      {players.some((player) => player.sessionID === userSessionId && player.team) && (
        <>
          {model && <NeonButton onPress={handleReadyPress} title={ready ? 'Not Ready' : 'Ready'} />}
          {isEveryOneReady &&
            areYouHost &&
            players.some((player) => player.team === TEAM.RED) &&
            players.some((player) => player.team === TEAM.BLUE) && (
              <NeonButton title="Start Game" onPress={onStartNextGamePhase} />
            )}
        </>
      )}
    </ImageBackground>
  );
};
