import React from 'react';
import { TouchableOpacity, Text, StyleSheet, GestureResponderEvent } from 'react-native';
import NeonText from '~/atoms/NeonText';
import { NEON_COLOR } from '~/utils/constants/constants';

interface NeonButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  color?: string;
}

export const NeonButton: React.FC<NeonButtonProps> = ({ title, onPress, disabled= false, color }) => {
  return (
    <TouchableOpacity 
      style={[styles.button, color ? { borderColor: color, shadowColor: color } : null]} 
      onPress={onPress} 
      activeOpacity={0.8} 
      disabled={disabled}
    >
      <NeonText style={(color ? { color: color, textShadowColor: color } : undefined)}>
      {title.toUpperCase()}
      </NeonText>
    </TouchableOpacity>
  );
};


const styles = StyleSheet.create({
  button: {
    backgroundColor: 'transparent',
    borderColor: NEON_COLOR,
    borderWidth: 3,
    borderRadius: 5,
    paddingVertical: 14,
    paddingHorizontal: 32, 
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: NEON_COLOR,
    elevation: 0.5,
    alignSelf: 'center', 
  },
});
