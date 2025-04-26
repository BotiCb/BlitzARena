import * as Progress from 'react-native-progress';
import { View, Text, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import NeonText from '~/atoms/NeonText';

export interface ProgressBarProps {
  progress: number;
  label?: string;
  style?: any;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label, style }) => {
  return (
    <View style={[styles.container, style]}>
      <NeonText style={styles.labelText}>{label && label.toUpperCase() }</NeonText>
      <View style={styles.progressContainer}>
        <Progress.Bar
          progress={progress / 100}
          width={null} // Fills container width
          height={28} // Matches container height
          color="#4bb0c2"
          borderRadius={5}
          borderWidth={0}
          unfilledColor="#b3b3b1"
        />
        <NeonText style={[styles.progressText, { color: 'white' }]}>
          {Math.round(progress)}%
        </NeonText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'static',
    width: '60%',
    padding: 'auto',
    alignSelf: 'center',
  },

  progressContainer: {
    height: 40,
    borderRadius: 10,
    borderColor: '#4bb0c2',
    borderWidth: 3,
    padding: 3,
    backgroundColor: 'rgba(200, 196, 192, 0.5)',
    justifyContent: 'center',
  },
  progressText: {
    position: 'absolute',
    left: '71%',

    fontSize: 20,
  },
  labelText: {
    fontSize: 20,
    marginBottom: 2,
  },
});
