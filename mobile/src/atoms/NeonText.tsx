import React from 'react';
import { Text, StyleSheet } from 'react-native';

export interface NeonTextProps {
  neonColor?: string;
  style?: any;
  children: React.ReactNode;
}

const NeonText = ({ neonColor = '#87fbff', style, children, ...props }: NeonTextProps) => {
  return (
    <Text
      style={[
        {
          fontFamily: 'Orbitron-Regular',
          fontSize: 32,
          color: neonColor,
          textShadowColor: neonColor,
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 8,
          textAlign: 'center',
        },
        style,
      ]}
      {...props}>
      {children}
    </Text>
  );
};

export default NeonText;
