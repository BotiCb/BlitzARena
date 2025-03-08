import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text } from 'react-native';
import { useDetection } from '~/contexts/DetectionContexts';
import { Player } from '~/utils/models';

const InBattlePlayerTag = () => {
  const { detectedPerson } = useDetection();
  const [displayedPlayer, setDisplayedPlayer] = useState<Player | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Handle initial mount and null states
    if (isInitialMount.current) {
      isInitialMount.current = false;
      setDisplayedPlayer(detectedPerson?.player || null);
      return;
    }

    const animation = Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    });

    animation.start(() => {
      // Update displayed player after fade out
      setDisplayedPlayer(detectedPerson?.player || null);
      
      // Fade back in with new value
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    });

    return () => animation.stop();
  }, [detectedPerson?.player?.sessionID]); // Only trigger on player change

  if (!displayedPlayer) return null;

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Text style={{ color: 'white' }}>
        {displayedPlayer.firstName} {displayedPlayer.lastName}
      </Text>
    </Animated.View>
  );
};

export default React.memo(InBattlePlayerTag);