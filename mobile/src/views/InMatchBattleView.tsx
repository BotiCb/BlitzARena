import React from 'react';
import { View } from 'react-native';
import SmallCountdownTimer from '~/atoms/SmallCountdownTimer';
import { useGame } from '~/contexts/GameContext';
import { useMatch } from '~/contexts/MatchContext';


const InMatchBattleView = () => {

  const { matchPhaseEndsAt } = useMatch();
  const isEndsAtValid = matchPhaseEndsAt && new Date(matchPhaseEndsAt).getTime() > Date.now();
  return (
    <View>
      {isEndsAtValid && <SmallCountdownTimer endsAt={matchPhaseEndsAt} />}
    </View>
  );
};

export default InMatchBattleView;