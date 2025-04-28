import React from 'react';
import { View } from 'react-native';
import BigCountdownTimer from '~/atoms/BigCountdownTimer';
import NeonText from '~/atoms/NeonText';
import { PlayerListComponent } from '~/components/PlayerListComponent';
import { useGame } from '~/contexts/GameContext';
import { useMatch } from '~/contexts/MatchContext';
import { TEAM } from '~/utils/types/types';

export const InMatchWaitingForPlayersView = () => {
  const { players, areYouHost, setPlayerAsHost, userSessionId, onRemovePlayer } = useGame();

  const { matchPhaseEndsAt, round, maxRounds, score} = useMatch();
  return (
    <View>
      
      <NeonText style={{ color: 'white', paddingBottom: 10, fontSize: 20 }}>
        Round: {round} / {maxRounds}
      </NeonText>
      {score && (
        <NeonText style={{ color: 'white' }}>
          {Object.keys(score).map((team, index, arr) => (
            <React.Fragment key={team}>
              <NeonText style={{ color: team }}>{score[team]}</NeonText>
              {index < arr.length - 1 ? ' : ' : ''}
            </React.Fragment>
          ))}
        </NeonText>
      )}
 
      {matchPhaseEndsAt ? 
        <BigCountdownTimer endsAt={matchPhaseEndsAt} /> : 
        <>
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
        </>
      }
    </View>
  );
};
