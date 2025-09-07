import React, {useState, useRef} from 'react';
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
import YouTubeModal from "../../modals/YoutubeModal";
import {usePreferences} from "../../../context/PreferencesContext";

const HymnControls = ({hymn, onNext, onPrevious, onShare, disabled}) => {
    const {toggleFavorite, isFavorite} = useHymns();
    const [isExpanded, setIsExpanded] = useState(false);
    const [showAudioPlayer, setShowAudioPlayer] = useState(false);
    const [showYouTubePlayer, setShowYouTubePlayer] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    const animatedHeight = useRef(new Animated.Value(0)).current;
    const audioPlayerWidth = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const audioPlayerRef = useRef(null);
    const { preferences, updatePreference } = usePreferences();

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
            justifyContent: 'space-around',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
        },
        bottomRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 6,
            paddingVertical: 4,
            minHeight: 40,
        },
        alwaysVisibleContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            flex: 1,
            gap: 6,
        },
        playButtonContainer: {
            marginHorizontal: 5,
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
            borderRadius: 24,
            borderColor: colors.textSecondary,
            width: 38,
            height: 38,
        },
        audioPlayerContainer: {
            overflow: 'hidden',
            borderRadius: 6,
            marginRight: 4,
        },
        progressContainer: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            paddingHorizontal: 12,
            paddingTop: 4,
            backgroundColor: colors.primary,
            borderTopLeftRadius: 6,
            borderTopRightRadius: 6,
        },
        chevronContainer: {
            alignItems: 'center',
            justifyContent: 'center',
        },
    });

    const isHymnFavorite = isFavorite(hymn?.id);

    const toggleExpand = () => {
        if (disabled) return;

        const toValue = isExpanded ? 0 : 1;

        Animated.parallel([
            Animated.timing(animatedHeight, {
                toValue: toValue,
                duration: 250,
                useNativeDriver: false,
            }),
            Animated.timing(rotateAnim, {
                toValue: toValue,
                duration: 250,
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
            duration: 250,
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

    const handleAudioPlay = () => {
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
            const sizes = ['small', 'medium', 'large', 'xlarge'];
            const currentIndex = sizes.indexOf(preferences.fontSize);
            const nextIndex = (currentIndex + 1) % sizes.length;
            updatePreference('fontSize', sizes[nextIndex]);
        }
    };

    const handleYoutube = () => {
        if (disabled) return;
        if (!hymn?.youtube) {
            Alert.alert('No YouTube Video', 'This hymn does not have a YouTube video available.');
            return;
        }

        // Close audio player if it's open
        if (showAudioPlayer && audioPlayerRef.current) {
            audioPlayerRef.current.handleStop();
            setShowAudioPlayer(false);
            Animated.timing(audioPlayerWidth, {
                toValue: 0,
                duration: 250,
                useNativeDriver: false,
            }).start();
        }

        setShowYouTubePlayer(true);
    };

    const closeYouTubePlayer = () => {
        setShowYouTubePlayer(false);
    };

    // Handle playing state updates from AudioTrackerPlayer
    const handlePlayingStateChange = (playing) => {
        setIsPlaying(playing);
    };

    // Interpolate animations
    const expandedHeight = animatedHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 60],
    });

    const playerWidth = audioPlayerWidth.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '45%'],
    });

    const controlButtons = [
        {
            name: 'chevron-back-outline',
            size: 24,
            color: disabled ? colors.textSecondary : colors.text,
            onPress: disabled ? null : onPrevious,
            label: 'Previous',
        },
        {
            name: 'text-outline',
            size: 24,
            color: disabled ? colors.textSecondary : colors.text,
            onPress: disabled ? null : handleFont,
            label: 'Font',
        },
        {
            name: 'logo-youtube',
            size: 24,
            color: disabled ? colors.textSecondary : (hymn?.youtube ? colors.danger : colors.textSecondary),
            onPress: disabled ? null : handleYoutube,
            label: 'YouTube',
        },
        {
            name: isHymnFavorite ? 'heart' : 'heart-outline',
            size: 24,
            color: disabled ? colors.textSecondary : (isHymnFavorite ? colors.danger : colors.text),
            onPress: disabled ? null : handleFavorite,
            label: 'Favorite',
        },
        {
            name: 'share-social-outline',
            size: 24,
            color: disabled ? colors.textSecondary : colors.text,
            onPress: disabled ? null : onShare,
            label: 'Share',
        },
        {
            name: 'chevron-forward-outline',
            size: 24,
            color: disabled ? colors.textSecondary : colors.text,
            onPress: disabled ? null : onNext,
            label: 'Next',
        },
    ];

    return (
        <View style={styles.container}>
            {/* YouTube Player Modal - Now separated */}
            <YouTubeModal
                visible={showYouTubePlayer}
                onClose={closeYouTubePlayer}
                youtubeVideoId={hymn?.youtube}
            />

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
                            compact={false}
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
                                    size={24}
                                    color={hymn?.audioUrl ? colors.header : colors.textSecondary}
                                    onPress={handleAudioPlay}
                                    disabled={disabled}
                                />
                            </View>
                            <View style={[
                                styles.playButtonContainer,
                                disabled && {opacity: 0.5}
                            ]}>
                                <FloatingButton
                                    name={"stop"}
                                    size={24}
                                    color={colors.danger}
                                    onPress={handleStop}
                                    disabled={disabled}
                                />
                            </View>
                        </>
                    )}

                    {/* YouTube Play Button - Only show if YouTube video is available */}
                    {hymn?.youtube && (
                        <View style={[
                            styles.playButtonContainer,
                            disabled && {opacity: 0.5}
                        ]}>
                            <FloatingButton
                                name="logo-youtube"
                                size={20}
                                color={colors.danger}
                                onPress={handleYoutube}
                                disabled={disabled}
                            />
                        </View>
                    )}

                    <View style={[
                        styles.playButtonContainer,
                        disabled && {opacity: 0.5}
                    ]}>
                        <FloatingButton
                            name={!isExpanded ? "chevron-up" : "chevron-down"}
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