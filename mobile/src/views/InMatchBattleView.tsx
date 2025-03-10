import { Container } from '@shopify/react-native-skia/lib/typescript/src/renderer/Container';
import React from 'react';
import { View, Button, StyleSheet, Text } from 'react-native';
import SmallCountdownTimer from '~/atoms/SmallCountdownTimer';
import { useDetection } from '~/contexts/DetectionContexts';
import { useGame } from '~/contexts/GameContext';
import { useMatch } from '~/contexts/MatchContext';
import { useGunHandling } from '~/hooks/useGunHandling';


const InMatchBattleView = () => {

  const { matchPhaseEndsAt } = useMatch();
  const { shoot, isAbleToShoot, ammoInClip, totalAmmo } = useGunHandling();
  const { getHitPerson } = useDetection();
  return (
    <View  style={styles.container}>
     <SmallCountdownTimer endsAt={matchPhaseEndsAt}/>
     <Text>{ammoInClip}/{totalAmmo}</Text>
      <Button title='Shoot' onPress={() => shoot(getHitPerson())} disabled={!isAbleToShoot}/>
    </View>
  );
};

export default InMatchBattleView;

const styles = StyleSheet.create({
  container : {
    display: 'flex',
    height: '100%',
    position: 'absolute',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'flex-end',
    flexDirection: 'row',
    padding: 20
  },
});