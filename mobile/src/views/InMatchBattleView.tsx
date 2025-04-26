import { Container } from '@shopify/react-native-skia/lib/typescript/src/renderer/Container';
import React from 'react';
import { View, Button, StyleSheet, Text, TouchableWithoutFeedback } from 'react-native';
import SmallCountdownTimer from '~/atoms/SmallCountdownTimer';
import { Scope } from '~/components/Scope';
import { useDetection } from '~/contexts/DetectionContexts';
import { useMatch } from '~/contexts/MatchContext';

import { InMatchHud } from '~/components/BottomInMatchBar';
import NeonText from '~/atoms/NeonText';

const InMatchBattleView = () => {
  const { matchPhaseEndsAt, healthPoints } = useMatch();
  const { getHitPerson } = useDetection();
  const { gunHandling, score } = useMatch();
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        gunHandling.shoot(getHitPerson());
      }}
      disabled={
        gunHandling.isReloading || !gunHandling.isAbleToShoot || gunHandling.ammoInClip === 0
      }>
      <View style={styles.container}>

        {matchPhaseEndsAt && <SmallCountdownTimer endsAt={matchPhaseEndsAt} />}
        {healthPoints > 0 && <Scope />}
        {healthPoints > 0 ? (
          <InMatchHud healthPoints={healthPoints} gunHandling={gunHandling} />
        ) : (
          <NeonText style={{ marginRight: 10, color: 'white', height: '100%', justifyContent: 'center', position: 'absolute' }}>You are eliminated</NeonText>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default InMatchBattleView;

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    height: '100%',
    position: 'absolute',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'flex-end',
    flexDirection: 'row',
    paddingBottom: 100,
  },
});
