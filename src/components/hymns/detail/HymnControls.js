import React, {useState, useRef, useEffect} from 'react';
import {
    View,
    StyleSheet,
    Alert,
    Animated,
} from 'react-native';
import {useHymns} from '../../../context/HymnContext';
import FloatingButton from '../../ui/FloatingButton';
import {useTheme} from "../../../context/ThemeContext";
import AudioTrackerPlayer from "../../audioPlayer/AudioTrackerPlayer";

const HymnControls = ({hymn, onNext, onPrevious, onShare, disabled}) => {
    const {toggleFavorite, isFavorite} = useHymns();
    const [isExpanded, setIsExpanded] = useState(false);
    const [showAudioPlayer, setShowAudioPlayer] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    const animatedHeight = useRef(new Animated.Value(0)).current;
    const audioPlayerWidth = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const audioPlayerRef = useRef(null);

    const {colors} = useTheme().theme;

    const styles = StyleSheet.create({
        container: {
            backgroundColor: colors.primary,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            position: 'relative',
        },
        expandedContainer: {
            overflow: 'hidden',
            backgroundColor: colors.card,
        },
        controlsGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-around',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 16,
            height: 80,
        },
        bottomRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 8,
            paddingVertical: 6,
            minHeight: 50,
        },
        alwaysVisibleContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            flex: 1,
        },
        playButtonContainer: {
            marginHorizontal: 1,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 1,
            },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
            borderWidth: 1,
            borderRadius: 23,
            borderColor: colors.textSecondary,
        },
        audioPlayerContainer: {
            overflow: 'hidden',
            borderRadius: 8,
            marginRight: 8,
        },
        progressContainer: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            paddingHorizontal: 16,
            paddingTop: 8,
            backgroundColor: colors.primary,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
        },
        chevronContainer: {
            alignItems: 'center',
            justifyContent: 'center',
        },
    });

    const isHymnFavorite = isFavorite(hymn?.id);

    // Effect to auto-expand when playing starts
    useEffect(() => {
        if (isPlaying && !isExpanded) {
            toggleExpand();
        }
    }, [isPlaying]);

    const toggleExpand = () => {
        if (disabled) return;

        const toValue = isExpanded ? 0 : 1;

        Animated.parallel([
            Animated.timing(animatedHeight, {
                toValue: toValue,
                duration: 300,
                useNativeDriver: false,
            }),
            Animated.timing(rotateAnim, {
                toValue: toValue,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();

        setIsExpanded(!isExpanded);
    };

    const toggleAudioPlayer = () => {
        if (!hymn?.audioUrl || disabled) {
            Alert.alert('No Audio', 'This hymn does not have an audio file available.');
            return;
        }

        const toValue = showAudioPlayer ? 0 : 1;

        Animated.timing(audioPlayerWidth, {
            toValue: toValue,
            duration: 300,
            useNativeDriver: false,
        }).start();

        setShowAudioPlayer(!showAudioPlayer);
    };

    const handlePlayPause = async () => {
        if (!hymn?.audioUrl || disabled) {
            Alert.alert('No Audio', 'This hymn does not have an audio file available.');
            return;
        }

        // Show audio player if not visible
        if (!showAudioPlayer) {
            toggleAudioPlayer();
        }

        // Call the audio player's play/pause method
        if (audioPlayerRef.current) {
            await audioPlayerRef.current.handlePlayPause();
        }
    };

    const handlePlay = () => {
        if (disabled) return;
        handlePlayPause();
    };

    const handleStop = async () => {
        if (disabled) return;
        if (audioPlayerRef.current) {
            await audioPlayerRef.current.handleStop();
        }
    };

    const handleFavorite = () => {
        if (hymn && !disabled) {
            toggleFavorite(hymn);
        }
    };

    const handleFont = () => {
        if (!disabled) {
            Alert.alert('Font Size', 'Font size adjustment coming soon!');
        }
    };

    // Handle playing state updates from AudioTrackerPlayer
    const handlePlayingStateChange = (playing) => {
        setIsPlaying(playing);
    };

    // Interpolate animations
    const expandedHeight = animatedHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 80], // Height of the expanded controls
    });

    const playerWidth = audioPlayerWidth.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '50%'], // Reduced width to fit better
    });

    const controlButtons = [
        {
            name: 'chevron-back-outline',
            size: 28,
            color: disabled ? colors.textSecondary : colors.text,
            onPress: disabled ? null : onPrevious,
            label: 'Previous',
        },
        {
            name: 'text-outline',
            size: 28,
            color: disabled ? colors.textSecondary : colors.text,
            onPress: disabled ? null : handleFont,
            label: 'Font',
        },
        {
            name: isHymnFavorite ? 'heart' : 'heart-outline',
            size: 28,
            color: disabled ? colors.textSecondary : (isHymnFavorite ? colors.danger : colors.text),
            onPress: disabled ? null : handleFavorite,
            label: 'Favorite',
        },
        {
            name: 'share-social-outline',
            size: 28,
            color: disabled ? colors.textSecondary : colors.text,
            onPress: disabled ? null : onShare,
            label: 'Share',
        },
        {
            name: 'chevron-forward-outline',
            size: 28,
            color: disabled ? colors.textSecondary : colors.text,
            onPress: disabled ? null : onNext,
            label: 'Next',
        },
    ];

    return (
        <View style={styles.container}>
            {/* Expanded Controls */}
            <Animated.View
                style={[styles.expandedContainer, {height: expandedHeight}]}
            >
                <View style={styles.controlsGrid}>
                    {controlButtons.map((button, index) => (
                        <FloatingButton
                            key={index}
                            name={button.name}
                            size={button.size}
                            color={button.color}
                            onPress={button.onPress}
                            disabled={disabled}
                        />
                    ))}
                </View>
            </Animated.View>

            {/* Bottom Row: Audio Player and Always Visible Controls */}
            <View style={styles.bottomRow}>
                <Animated.View
                    style={[styles.audioPlayerContainer, {width: playerWidth}]}
                >
                    <AudioTrackerPlayer
                        ref={audioPlayerRef}
                        hymn={hymn}
                        onPlayingStateChange={handlePlayingStateChange}
                    />
                </Animated.View>

                {/* Always Visible Controls - on the right side */}
                <View style={styles.alwaysVisibleContainer}>
                    {hymn?.audioUrl && (
                        <>
                            <View style={[
                                styles.playButtonContainer,
                                disabled && {opacity: 0.5}
                            ]}>
                                <FloatingButton
                                    name={showAudioPlayer && isPlaying ? "pause" : "play"}
                                    size={28}
                                    color={hymn?.audioUrl ? colors.notification : colors.textSecondary}
                                    onPress={handlePlay}
                                    disabled={disabled}
                                />
                            </View>
                            <View style={[
                                styles.playButtonContainer,
                                disabled && {opacity: 0.5}
                            ]}>
                                <FloatingButton
                                    name={"stop"}
                                    size={28}
                                    color={colors.danger}
                                    onPress={handleStop}
                                    disabled={disabled}
                                />
                            </View>
                        </>
                    )}
                    <View style={[
                        styles.playButtonContainer,
                        disabled && {opacity: 0.5}
                    ]}>
                        <FloatingButton
                            name={isExpanded ? "chevron-up" : "chevron-down"}
                            size={24}
                            color={colors.text}
                            onPress={toggleExpand}
                            disabled={disabled}
                        />
                    </View>
                </View>
            </View>
        </View>
    );
};

export default HymnControls;
