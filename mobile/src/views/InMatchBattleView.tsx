import { Container } from '@shopify/react-native-skia/lib/typescript/src/renderer/Container';
import React from 'react';
import { View, Button, StyleSheet, Text } from 'react-native';
import { ProgressBar } from '~/atoms/ProgressBar';
import SmallCountdownTimer from '~/atoms/SmallCountdownTimer';
import { Scope } from '~/components/Scope';
import { useDetection } from '~/contexts/DetectionContexts';
import { useGame } from '~/contexts/GameContext';
import { useMatch } from '~/contexts/MatchContext';
import { useGunHandling } from '~/hooks/useGunHandling';


const InMatchBattleView = () => {

  const { matchPhaseEndsAt, healthPoints } = useMatch();
  const { getHitPerson } = useDetection();
  const { gunHandling } = useMatch();
  return (
    <View style={styles.container}>
      
      {matchPhaseEndsAt && <SmallCountdownTimer endsAt={matchPhaseEndsAt} />}
      {healthPoints > 0 && <Scope/>}
      {healthPoints ? (
        <View>
          <Text style={{ marginRight: 10, color: 'white' }}>{gunHandling.ammoInClip}/{gunHandling.totalAmmo}</Text>
          <ProgressBar progress={healthPoints} />
          <Button title='Shoot' onPress={() => gunHandling.shoot(getHitPerson())} disabled={!gunHandling.isAbleToShoot} />
          <Button title='Reload' onPress={() => gunHandling.reload()} />
        </View>
      )
      :
      (
        <Text style={{ marginRight: 10, color: 'white' }}>You are eliminated</Text>
      )}
    </View>
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