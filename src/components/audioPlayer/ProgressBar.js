import React, {useRef, useState} from 'react';
import {Text, View, StyleSheet, PanResponder} from "react-native";
import {formatTime} from "../../utils/formatTime";
import {useTheme} from "../../context/ThemeContext";

export const ProgressBar = ({progress, progressPercentage, onSeek}) => {
    const {colors} = useTheme().theme;
    const progressBarRef = useRef(null);
    const [containerWidth, setContainerWidth] = useState(0);

    // Handle layout to get container width
    const handleLayout = (event) => {
        const {width} = event.nativeEvent.layout;
        setContainerWidth(width);
    };

    // Handle touch events for seeking
    const handleProgressTouch = (event) => {
        if (!onSeek || progress.duration === 0 || containerWidth === 0) return;

        const {locationX} = event.nativeEvent;
        const percentage = Math.max(0, Math.min(1, locationX / containerWidth));
        const seekTime = percentage * progress.duration;
        onSeek(Math.max(0, Math.min(seekTime, progress.duration)));
    };

    // Create PanResponder for more precise touch handling
    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
            handleProgressTouch(event);
        },
        onPanResponderMove: (event) => {
            handleProgressTouch(event);
        },
        onPanResponderRelease: () => {
            // Optional: Add haptic feedback here
        },
    });

    const styles = StyleSheet.create({
        container: {
            // Add container styles if needed
        },
        progressBar: {
            height: 20, // Increased height for better touch target
            backgroundColor: colors.card,
            position: 'relative',
            justifyContent: 'center',
            overflow: 'hidden',
            borderRadius: 4,
        },
        progressFill: {
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            backgroundColor: colors.header,
            width: `${progressPercentage}%`,
            borderRadius: 4,
        },
        touchableArea: {
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            zIndex: 2,
        },
        timeContainer: {
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 8,
            zIndex: 1,
        },
        timeText: {
            fontSize: 11,
            fontWeight: '600',
            color: colors.text,
            textShadowColor: 'rgba(255, 255, 255, 0.8)',
            textShadowOffset: {width: 0, height: 0},
            textShadowRadius: 2,
        },
        timeTextOnProgress: {
            color: colors.primary,
            textShadowColor: 'rgba(0, 0, 0, 0.3)',
            textShadowOffset: {width: 0, height: 1},
            textShadowRadius: 1,
        },
        seekIndicator: {
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: 3,
            backgroundColor: colors.primary,
            opacity: 0.8,
            zIndex: 3,
            left: `${progressPercentage}%`,
            marginLeft: -1.5,
        },
    });

    // Calculate if text should be white (when over the progress fill)
    const currentTimeWidth = 60; // Approximate width of time text
    const totalWidth = 100; // Assuming 100% width
    const isCurrentTimeOnProgress = (currentTimeWidth / totalWidth * 100) < progressPercentage;
    const isDurationOnProgress = progressPercentage > 84;

    return (
        <View
            style={styles.progressBar}
            onLayout={handleLayout}
            ref={progressBarRef}
        >
            <View style={styles.progressFill}/>

            {/* Seek indicator dot */}
            <View style={styles.seekIndicator}/>

            {/* Time display */}
            <View style={styles.timeContainer}>
                <Text style={[
                    styles.timeText,
                    isCurrentTimeOnProgress && styles.timeTextOnProgress
                ]}>
                    {formatTime(progress.position)}
                </Text>
                <Text style={[
                    styles.timeText,
                    isDurationOnProgress && styles.timeTextOnProgress
                ]}>
                    {formatTime(progress.duration)}
                </Text>
            </View>

            {/* Touchable area for seeking */}
            <View
                style={styles.touchableArea}
                {...panResponder.panHandlers}
            />
        </View>
    );
};
