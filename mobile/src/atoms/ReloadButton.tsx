import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import * as Progress from 'react-native-progress';
import NeonText from '~/atoms/NeonText';
import { NEON_COLOR } from '~/utils/constants/constants';

export interface ReloadProgressButtonProps {
    date: number | null;
    onClick?: () => void;
    isReloading?: boolean;
}

export const ReloadButton = ({ date, onClick, isReloading }: ReloadProgressButtonProps) => {
    const [progress, setProgress] = useState(0);


    useEffect(() => {
        if (!date) return;

        const now = Date.now();
        const newStartTime = now;
        const newTotalDuration = date - now;


        const updateProgress = () => {
            const currentTime = Date.now();
            const elapsed = currentTime - newStartTime;
            let newProgress = elapsed / newTotalDuration;

            if (newProgress >= 1 || currentTime >= date) {
                newProgress = 1;
                clearInterval(interval);
                setProgress(0);
                return;
            }

            setProgress(newProgress);
        };

        const interval = setInterval(updateProgress, 20);
        updateProgress(); // Initial update

        return () => clearInterval(interval);
    }, [date]);

    const handlePress = () => {
        if (!isReloading && onClick) {
            onClick();
        }
    };

    return (
        <TouchableOpacity onPress={handlePress} disabled={isReloading}>
            <View style={styles.container}>
                <Progress.Circle
                    size={120}
                    progress={progress}
                    color={NEON_COLOR}
                    unfilledColor="#eee"
                    borderWidth={0}
                    strokeCap="round"
                    showsText={false}
                    thickness={10}
                />
                <View style={styles.textContainer}>
                    <NeonText style={styles.reloadText}>Reload</NeonText>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    reloadText: {
        fontSize: 14,
        marginTop: 4,
    },
});