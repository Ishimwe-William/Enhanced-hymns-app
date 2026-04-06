import React, {useState, useRef, useMemo, useEffect, useCallback} from 'react';
import {View, StyleSheet, Alert, Animated, useWindowDimensions} from 'react-native';
import {useHymns} from '../../../context/HymnContext';
import FloatingButton from '../../ui/FloatingButton';
import {useTheme} from "../../../context/ThemeContext";
import AudioTrackerPlayer from "../../audioPlayer/AudioTrackerPlayer";
import {ProgressBar} from "../../audioPlayer/ProgressBar";
import {usePreferences} from "../../../context/PreferencesContext";

const HymnControls = ({hymn, onNext, onPrevious, onShare, disabled}) => {
    const {toggleFavorite, isFavorite} = useHymns();
    const [showSecondary, setShowSecondary] = useState(false);
    const [showAudioPlayer, setShowAudioPlayer] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState({position: 0, duration: 0, buffered: 0});

    const secondaryAnim = useRef(new Animated.Value(0)).current;
    const audioAnim     = useRef(new Animated.Value(0)).current;
    const rotateAnim    = useRef(new Animated.Value(0)).current;
    const audioPlayerRef = useRef(null);

    const {preferences, updatePreference} = usePreferences();
    const currentHymnIdRef = useRef(null);
    const {colors} = useTheme().theme;
    const {width} = useWindowDimensions();

    const isSmall  = width < 360;
    const btnSize  = isSmall ? 34 : 38;
    const iconSize = isSmall ? 16 : 18;
    const rowPad   = isSmall ? 8 : 12;
    const gap      = isSmall ? 4 : 6;

    // Stable progress callback — no re-render churn
    const handleProgressChange = useCallback((p) => setProgress(p), []);


    const styles = useMemo(() => StyleSheet.create({
        wrapper: {
            backgroundColor: colors.card,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.border,
            shadowColor: '#000',
            shadowOffset: {width: 0, height: -2},
            shadowOpacity: 0.07,
            shadowRadius: 8,
            elevation: 10,
        },
        // Pure clip container — no padding, no background, no nested overflow
        audioClip: {
            overflow: 'hidden',
        },
        audioStripInner: {
            paddingHorizontal: rowPad,
            paddingTop: 8,
            paddingBottom: 6,
            backgroundColor: colors.primary,
        },
        secondaryClip: {
            overflow: 'hidden',
        },
        secondaryInner: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            paddingVertical: isSmall ? 7 : 9,
            paddingHorizontal: rowPad,
            backgroundColor: colors.primary,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.border,
        },
        mainRow: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: rowPad,
            paddingVertical: isSmall ? 6 : 8,
            gap,
        },
        btn: {
            width: btnSize,
            height: btnSize,
            borderRadius: btnSize / 2,
            alignItems: 'center',
            justifyContent: 'center',
        },
        playBtn: {
            backgroundColor: colors.header + '20',
            borderWidth: 1.5,
            borderColor: colors.header + '50',
        },
        stopBtn: {
            backgroundColor: colors.danger + '15',
            borderWidth: 1.5,
            borderColor: colors.danger + '40',
        },
        noteBtn: {
            backgroundColor: colors.primary,
            borderWidth: 1.5,
            borderColor: colors.border,
        },
        noteBtnActive: {
            backgroundColor: colors.header + '20',
            borderColor: colors.header + '60',
        },
        expandBtn: {
            backgroundColor: colors.primary,
            borderWidth: 1,
            borderColor: colors.border,
        },
        expandBtnActive: {
            backgroundColor: colors.header + '20',
            borderColor: colors.header + '40',
        },
        spacer: {flex: 1},
        faded: {opacity: 0.4},
    }), [colors, isSmall, btnSize, rowPad, gap]);

    const hasAudio       = !!hymn?.audioUrl;
    const isHymnFavorite = isFavorite(hymn?.id);
    const progressPct    = progress.duration > 0 ? (progress.position / progress.duration) * 100 : 0;

    // Animated heights — fixed targets, no nested overflow issues
    const AUDIO_H     = 42; // 8 + 28 (bar) + 6
    const SECONDARY_H = isSmall ? 50 : 56;

    const audioHeight     = audioAnim.interpolate({inputRange: [0, 1], outputRange: [0, AUDIO_H]});
    const secondaryHeight = secondaryAnim.interpolate({inputRange: [0, 1], outputRange: [0, SECONDARY_H]});
    const chevronRotate   = rotateAnim.interpolate({inputRange: [0, 1], outputRange: ['0deg', '180deg']});

    // Height animations must use timing — spring overshoots and causes double-clip effect
    const slideHeight = (anim, toValue) =>
        Animated.timing(anim, {toValue, duration: 240, useNativeDriver: false}).start();

    const toggleSecondary = () => {
        if (disabled) return;
        const next = !showSecondary;
        slideHeight(secondaryAnim, next ? 1 : 0);
        Animated.timing(rotateAnim, {toValue: next ? 1 : 0, duration: 220, useNativeDriver: true}).start();
        setShowSecondary(next);
    };

    const openAudioStrip = () => {
        if (!showAudioPlayer) {
            slideHeight(audioAnim, 1);
            setShowAudioPlayer(true);
        }
    };

    const toggleAudioStrip = () => {
        if (!hasAudio || disabled) {
            Alert.alert('No Audio', 'This hymn does not have an audio file available.');
            return;
        }
        const next = !showAudioPlayer;
        slideHeight(audioAnim, next ? 1 : 0);
        setShowAudioPlayer(next);
    };

    const handlePlayPause = async () => {
        if (!hasAudio || disabled) {
            Alert.alert('No Audio', 'This hymn does not have an audio file available.');
            return;
        }
        openAudioStrip();
        await audioPlayerRef.current?.handlePlayPause();
    };

    const handleStop = async () => {
        if (disabled) return;
        await audioPlayerRef.current?.handleStop();
        setIsPlaying(false);
    };

    const handleSeek = (seekTime) => audioPlayerRef.current?.handleSeek(seekTime);

    const secondaryButtons = [
        {name: 'chevron-back',
            color: colors.text, onPress: onPrevious},
        {name: 'text-outline',
            color: colors.text, onPress: () => {
                if (disabled) return;
                const sizes = ['small', 'medium', 'large', 'xlarge'];
                updatePreference('fontSize', sizes[(sizes.indexOf(preferences.fontSize) + 1) % sizes.length]);
            }},
        {name: isHymnFavorite ? 'heart' : 'heart-outline',
            color: isHymnFavorite ? colors.danger : colors.text,
            onPress: () => hymn && !disabled && toggleFavorite(hymn)},
        {name: 'share-social-outline',
            color: colors.text, onPress: onShare},
        {name: 'chevron-forward',
            color: colors.text, onPress: onNext},
    ];

    return (
        <View style={styles.wrapper}>
            {/* Headless player — always mounted, no UI */}
            <AudioTrackerPlayer
                key={hymn?.firebaseId || hymn?.id}
                ref={audioPlayerRef}
                hymn={hymn}
                onPlayingStateChange={setIsPlaying}
                onProgressChange={handleProgressChange}
            />

            {/* ── Progress bar strip ── pure clip, ProgressBar rendered flat inside */}
            <Animated.View style={[styles.audioClip, {height: audioHeight}]}>
                <View style={styles.audioStripInner}>
                    <ProgressBar
                        progress={progress}
                        progressPercentage={progressPct}
                        onSeek={handleSeek}
                        disabled={false}
                    />
                </View>
            </Animated.View>

            {/* ── Secondary nav row ── */}
            <Animated.View style={[styles.secondaryClip, {height: secondaryHeight}]}>
                <View style={styles.secondaryInner}>
                    {secondaryButtons.map((btn, i) => (
                        <FloatingButton
                            key={i}
                            name={btn.name}
                            size={iconSize}
                            color={disabled ? colors.textSecondary : btn.color}
                            onPress={disabled ? null : btn.onPress}
                            disabled={disabled}
                        />
                    ))}
                </View>
            </Animated.View>

            {/* ── Single compact main row ── */}
            <View style={styles.mainRow}>
                {hasAudio && (
                    <View style={[styles.btn, showAudioPlayer ? styles.noteBtnActive : styles.noteBtn, disabled && styles.faded]}>
                        <FloatingButton
                            name="musical-note-outline"
                            size={iconSize}
                            color={showAudioPlayer ? colors.header : colors.textSecondary}
                            onPress={toggleAudioStrip}
                            disabled={disabled}
                        />
                    </View>
                )}
                {hasAudio && (
                    <View style={[styles.btn, styles.playBtn, disabled && styles.faded]}>
                        <FloatingButton
                            name={isPlaying ? 'pause' : 'play'}
                            size={iconSize}
                            color={colors.header}
                            onPress={handlePlayPause}
                            disabled={disabled}
                        />
                    </View>
                )}
                {hasAudio && (
                    <View style={[styles.btn, styles.stopBtn, disabled && styles.faded]}>
                        <FloatingButton
                            name="stop"
                            size={iconSize}
                            color={colors.danger}
                            onPress={handleStop}
                            disabled={disabled}
                        />
                    </View>
                )}

                <View style={styles.spacer} />

                <Animated.View style={[
                    styles.btn,
                    showSecondary ? styles.expandBtnActive : styles.expandBtn,
                    {transform: [{rotate: chevronRotate}]},
                    disabled && styles.faded,
                ]}>
                    <FloatingButton
                        name="chevron-up"
                        size={iconSize}
                        color={showSecondary ? colors.header : colors.text}
                        onPress={toggleSecondary}
                        disabled={disabled}
                    />
                </Animated.View>
            </View>
        </View>
    );
};

export default HymnControls;