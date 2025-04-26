import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ProgressBar } from './ProgressBar';
import { ReloadButton } from '~/atoms/ReloadButton';
import { HitPerson } from '~/services/websocket/websocket-types';
import NeonText from '~/atoms/NeonText';
import { useMatch } from '~/contexts/MatchContext';

export interface BottomInMatchBarProps {
  healthPoints: number;
  gunHandling: {
    shoot: (detectedPerson: HitPerson | null) => void;
    reload: () => void;
    isAbleToShoot: boolean;
    nextShootAt: number | null;
    ammoInClip: number;
    totalAmmo: number;
    isReloading: boolean;
  };
}

export const InMatchHud = ({ healthPoints, gunHandling }: BottomInMatchBarProps) => {
  const { score, round, maxRounds } = useMatch();

  return (
    <>
      {/* Top Bar - Score & Round */}
      {score && (
        <View style={styles.topContainer}>
          <NeonText style={styles.roundText}>
            Round {round} of {maxRounds}
          </NeonText>
          <View style={styles.scoreContainer}>
            {Object.entries(score).map(([team, points], index) => (
              <React.Fragment key={team}>
                <NeonText style={{ color: team }}>{points}</NeonText>
                {index < Object.keys(score).length - 1 && (
                  <NeonText style={styles.colon}> : </NeonText>
                )}
              </React.Fragment>
            ))}
          </View>
        </View>
      )}

      {/* Bottom Bar - Health & Reload */}
      <View style={styles.bottomContainer}>
        {/* Left Side - Health Progress */}
        <ProgressBar 
          progress={healthPoints} 
          style={styles.healthBar}
        />

        {/* Right Side - Reload & Ammo */}
        <View style={styles.reloadContainer}>
          <ReloadButton
            onClick={() => gunHandling.reload()}
            date={gunHandling.nextShootAt}
            isReloading={gunHandling.isReloading}
          />
          <NeonText
            style={styles.ammoText}
            neonColor={
              gunHandling.ammoInClip === 0 || gunHandling.isReloading 
                ? '#ff0000' 
                : '#00ff00'
            }>
            {gunHandling.ammoInClip}/{gunHandling.totalAmmo}
          </NeonText>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  topContainer: {
    position: 'absolute',
    top: 10,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  roundText: {
    color: '#fff',
    fontSize: 18,
  },
  colon: {
    color: '#fff',
    fontSize: 18,
  },
  healthBar: {
    width: 200,
    height: 12,
    borderRadius: 6,
  },
  reloadContainer: {
    alignItems: 'center',
    gap: 8,
  },
  ammoText: {
    fontSize: 20,
    textAlign: 'center',
    includeFontPadding: false,
  },
});