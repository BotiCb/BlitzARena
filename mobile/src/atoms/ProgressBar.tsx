import * as Progress from 'react-native-progress';
import { View, Text, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';

export interface ProgressBarProps {
  progress: number;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.labelText}>{label ? label.toUpperCase() : 'PROGRESS'}</Text>
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
        <Text style={[styles.progressText, progress > 80 ? { color: 'rgba(200, 196, 192, 1)' } : {}]}>
          {Math.round(progress)}%
        </Text>
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
    left: '78%',
    color: '#4bb0c2',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
  },
  labelText: {
    color: '#4bb0c2',
    fontFamily: 'Poppins',
    fontSize: 20,
    marginBottom: 2,
    textAlign: 'center',
  },
});
