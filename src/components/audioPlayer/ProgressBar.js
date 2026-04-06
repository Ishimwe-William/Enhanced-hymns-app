import React, {useRef, useState} from 'react';
import {Text, View, StyleSheet, PanResponder} from "react-native";
import {formatTime} from "../../utils/formatTime";
import {useTheme} from "../../context/ThemeContext";

export const ProgressBar = ({progress, progressPercentage, onSeek, disabled}) => {
    const {colors} = useTheme().theme;
    const progressBarRef = useRef(null);
    const [containerWidth, setContainerWidth] = useState(0);

    const handleLayout = (event) => {
        const {width} = event.nativeEvent.layout;
        setContainerWidth(width);
    };

    const handleProgressTouch = (event) => {
        if (!onSeek || progress.duration === 0 || containerWidth === 0 || disabled) return;
        const {locationX} = event.nativeEvent;
        const percentage = Math.max(0, Math.min(1, locationX / containerWidth));
        const seekTime = percentage * progress.duration;
        onSeek(Math.max(0, Math.min(seekTime, progress.duration)));
    };

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponder: () => !disabled,
        onPanResponderGrant: (event) => handleProgressTouch(event),
        onPanResponderMove: (event) => handleProgressTouch(event),
        onPanResponderRelease: () => {},
    });

    const isCurrentTimeOnProgress = (60 / containerWidth * 100) < progressPercentage;
    const isDurationOnProgress = progressPercentage > 84;

    return (
        <View
            style={[styles.progressBar, {backgroundColor: colors.border}]}
            onLayout={handleLayout}
            ref={progressBarRef}
        >
            {/* Fill */}
            <View style={[
                styles.progressFill,
                {
                    backgroundColor: colors.header,
                    width: `${progressPercentage}%`,
                }
            ]} />

            {/* Thumb indicator */}
            <View style={[
                styles.seekIndicator,
                {
                    backgroundColor: colors.header,
                    left: `${progressPercentage}%`,
                }
            ]} />

            {/* Time labels */}
            <View style={styles.timeContainer}>
                <Text style={[
                    styles.timeText,
                    {color: isCurrentTimeOnProgress ? colors.card : colors.text},
                ]}>
                    {formatTime(progress.position)}
                </Text>
                <Text style={[
                    styles.timeText,
                    {color: isDurationOnProgress ? colors.card : colors.text},
                ]}>
                    {formatTime(progress.duration)}
                </Text>
            </View>

            {/* Touch layer */}
            <View style={styles.touchableArea} {...panResponder.panHandlers} />
        </View>
    );
};

const styles = StyleSheet.create({
    progressBar: {
        height: 28,
        borderRadius: 6,
        position: 'relative',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    progressFill: {
        position: 'absolute',
        left: 0,
        top: 0,
        height: '100%',
        borderRadius: 6,
    },
    seekIndicator: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 2.5,
        opacity: 0.9,
        zIndex: 3,
        marginLeft: -1.25,
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
    },
    touchableArea: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        zIndex: 2,
    },
});