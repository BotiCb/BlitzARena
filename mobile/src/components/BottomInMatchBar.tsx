import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ProgressBar } from './ProgressBar';
import { ReloadButton } from '~/atoms/ReloadButton';
import { HitPerson } from '~/services/websocket/websocket-types';
import NeonText from '~/atoms/NeonText';
import { useMatch } from '~/contexts/MatchContext';
import { useDetection } from '~/contexts/DetectionContexts';
import { useGame } from '~/contexts/GameContext';
import { Player } from '~/utils/models';

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
  const { detectedPlayer } = useDetection();
  const { players } = useGame ();
  const [detectedPlayerObject, setDetectedPlayerObject] = useState<Player | null>(null);

  useEffect(() => {
    if (detectedPlayer) {
      const player = players.find((player) => player.sessionID === detectedPlayer);
      setDetectedPlayerObject(player || null);
    } else {
      setDetectedPlayerObject(null);
    }
  }, [detectedPlayer]);

  return (
    <>
      {/* Top Section */}
      <View style={styles.topSection}>
        {/* Score & Round Row */}
        {score && (
          <View style={styles.scoreRoundContainer}>
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

        {/* Detected Player Info */}
        {detectedPlayerObject && (
          <View style={styles.playerInfoContainer}>
            <NeonText style={styles.playerName}>
              {detectedPlayerObject.firstName} {detectedPlayerObject.lastName}
              {detectedPlayerObject.isEliminated && (
                <NeonText style={styles.eliminatedIndicator}> X</NeonText>
              )}
            </NeonText>
          </View>
        )}
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomContainer}>
        {/* Health Progress Bar */}
        <ProgressBar progress={healthPoints} style={styles.healthBar} />

        {/* Reload & Ammo Section */}
        <View style={styles.reloadSection}>
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
  topSection: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  scoreRoundContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 15,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  roundText: {
    color: '#ffffff',
    fontSize: 20,
    textShadowColor: '#ffffff',
    textShadowRadius: 10,
  },
  colon: {
    color: '#ffffff',
    fontSize: 20,
  },
  playerInfoContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  playerName: {
    fontSize: 28,
    color: '#ffffff',
    textShadowColor: '#ffffff',
    textShadowRadius: 10,
  },
  eliminatedIndicator: {
    color: '#ff0000',
    fontSize: 32,
    textShadowColor: '#ff0000',
    textShadowRadius: 15,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 30,
  },
  healthBar: {
    width: 200,
    height: 15,
    borderRadius: 8,
  },
  reloadSection: {
    alignItems: 'center',
    gap: 10,
  },
  ammoText: {
    fontSize: 22,
    textAlign: 'center',
    includeFontPadding: false,
  },
});