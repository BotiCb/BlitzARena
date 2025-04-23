import React from 'react';
import { TouchableOpacity, Text, StyleSheet, GestureResponderEvent } from 'react-native';

interface NeonButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
}

export const NeonButton: React.FC<NeonButtonProps> = ({ title, onPress, disabled= false }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.8} disabled={disabled}>
      <Text style={styles.text}>{title.toUpperCase()}</Text>
    </TouchableOpacity>
  );
};

const neonColor = '#87fbff';

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'transparent',
    borderColor: neonColor,
    borderWidth: 3,
    borderRadius: 5,
    paddingVertical: 14,
    paddingHorizontal: 32, 
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: neonColor,
    elevation: 0.5,
    alignSelf: 'center', 
  },
  text: {
    fontFamily: 'Orbitron-Regular',
    fontSize: 32,
    color: neonColor,
    textShadowColor: neonColor,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    textAlign: 'center',
  },
});
