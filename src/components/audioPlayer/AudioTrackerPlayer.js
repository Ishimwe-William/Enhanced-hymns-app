import React, {useEffect, useState, forwardRef, useImperativeHandle, useRef} from 'react';
import {View, Text, StyleSheet, Alert} from 'react-native';
import TrackPlayer, {
    State,
    useProgress,
    useTrackPlayerEvents,
    Event,
    useIsPlaying,
} from 'react-native-track-player';
import {setupTrackPlayer, isSetup} from '../../services/TrackPlayerService';
import {ProgressBar} from "./ProgressBar";
import {useHymns} from "../../context/HymnContext";
import {useTheme} from "../../context/ThemeContext";
import * as FileSystem from 'expo-file-system';
import Constants from "expo-constants";

const AudioTrackerPlayer = forwardRef(({hymn, onPlayingStateChange}, ref) => {
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const [isSeeking, setIsSeeking] = useState(false);
    // Initialize as undefined to signify "not checked yet"
    const [audioSource, setAudioSource] = useState(undefined);
    const [audioAvailable, setAudioAvailable] = useState(false);

    const {playing} = useIsPlaying();
    const progress = useProgress();
    const {isOffline} = useHymns();
    const {artwork} = useTheme().theme;

    // Ref to prevent race conditions during setup
    const isSettingUpRef = useRef(false);

    // 1. OPTIMIZATION: Debounce the check to let UI slide animation finish first
    useEffect(() => {
        let isMounted = true;

        const checkAudio = async () => {
            if (!hymn) {
                if(isMounted) {
                    setAudioSource(null);
                    setAudioAvailable(false);
                }
                return;
            }

            try {
                // Optimistically assume remote first to avoid blocking immediately
                let source = hymn?.audioUrl;
                let exists = false;

                // Only check filesystem if we actually have a path
                // This reduces overhead if no local path is defined
                if (hymn?.localAudioPath) {
                    const info = await FileSystem.getInfoAsync(hymn.localAudioPath);
                    if (info.exists) {
                        source = hymn.localAudioPath;
                        exists = true;
                    }
                }

                if (!isMounted) return;

                if (isOffline) {
                    if (exists) {
                        setAudioSource(source);
                        setAudioAvailable(true);
                    } else {
                        setAudioSource(null);
                        setAudioAvailable(false);
                    }
                } else {
                    // Online mode: Use local if exists, otherwise remote
                    if (exists || hymn?.audioUrl) {
                        setAudioSource(exists ? source : hymn.audioUrl);
                        setAudioAvailable(true);
                    } else {
                        setAudioSource(null);
                        setAudioAvailable(false);
                    }
                }
            } catch (error) {
                console.error('Error determining audio source:', error);
                if(isMounted) {
                    setAudioSource(null);
                    setAudioAvailable(false);
                }
            }
        };

        // Delay check by 50ms to prioritize slide animation
        const timer = setTimeout(checkAudio, 50);

        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [hymn?.firebaseId, hymn?.audioUrl, hymn?.localAudioPath, isOffline]);

    // 2. OPTIMIZATION: Intelligent Player Setup (Don't reset if same track)
    useEffect(() => {
        if (!audioSource) {
            setIsPlayerReady(false);
            return;
        }

        const loadTrack = async () => {
            if (isSettingUpRef.current) return;
            isSettingUpRef.current = true;

            try {
                if (!isSetup()) {
                    await setupTrackPlayer();
                }

                // CHECK CURRENT TRACK BEFORE RESETTING
                // If the player is already loaded with this song, skip the heavy work.
                const currentTrackIndex = await TrackPlayer.getActiveTrackIndex();
                if (currentTrackIndex !== undefined) {
                    const currentTrack = await TrackPlayer.getTrack(currentTrackIndex);
                    // Compare URLs to see if it's the same song
                    if (currentTrack?.url === audioSource) {
                        setIsPlayerReady(true);
                        isSettingUpRef.current = false;
                        return;
                    }
                }

                // It's a different track, so we reset and add
                await TrackPlayer.reset();

                const track = {
                    id: hymn?.firebaseId || hymn?.number || 'default-hymn',
                    url: audioSource,
                    title: `${hymn.number} - ${hymn?.title}` || 'Unknown Hymn',
                    artist: Constants.expoConfig.extra.EXPO_PUBLIC_APP_NAME,
                    artwork: artwork,
                    duration: 0,
                };

                await TrackPlayer.add(track);
                setIsPlayerReady(true);
            } catch (error) {
                console.error('Failed to setup TrackPlayer:', error);
                setIsPlayerReady(false);
            } finally {
                isSettingUpRef.current = false;
            }
        };

        loadTrack();
    }, [audioSource, artwork, hymn]);

    // Handle seeking
    const handleSeek = async (seekTime) => {
        try {
            if (!isPlayerReady || progress.duration === 0) return;
            setIsSeeking(true);
            await TrackPlayer.seekTo(seekTime);
            // Small delay to prevent UI jumping
            setTimeout(() => setIsSeeking(false), 100);
        } catch (error) {
            console.error('Error seeking:', error);
            setIsSeeking(false);
        }
    };

    useImperativeHandle(ref, () => ({
        handlePlayPause: async () => {
            try {
                if (!audioAvailable) {
                    const msg = isOffline
                        ? 'Audio not available offline. Please download this hymn first.'
                        : 'No audio available for this hymn';
                    Alert.alert('Audio Unavailable', msg);
                    return;
                }

                if (!isPlayerReady) {
                    if (audioSource) {
                        // It's likely loading, ignore or show toast
                    } else {
                        Alert.alert('Error', 'Player is not ready yet');
                    }
                    return;
                }

                const playbackState = await TrackPlayer.getPlaybackState();
                const state = playbackState.state || playbackState; // Handle different RNTP versions

                // FIX: If track ended or stopped, restart from 0
                if (state === State.Ended || state === State.Stopped) {
                    await TrackPlayer.seekTo(0);
                    await TrackPlayer.play();
                    return;
                }

                if (state === State.Playing) {
                    await TrackPlayer.pause();
                } else {
                    await TrackPlayer.play();
                }
            } catch (error) {
                console.error('Error in handlePlayPause:', error);
            }
        },
        handleStop: async () => {
            try {
                if (!isPlayerReady) return;
                // OPTIMIZATION: Just pause and seek to 0 instead of resetting
                await TrackPlayer.pause();
                await TrackPlayer.seekTo(0);
            } catch (error) {
                console.error('Error in handleStop:', error);
            }
        },
        handleSeek: handleSeek,
        isAudioAvailable: () => audioAvailable,
        getAudioSource: () => audioSource,
    }));

    useTrackPlayerEvents([Event.RemotePlay, Event.RemotePause, Event.RemoteStop], async (event) => {
        try {
            if (event.type === Event.RemotePlay) {
                await TrackPlayer.play();
            } else if (event.type === Event.RemotePause) {
                await TrackPlayer.pause();
            } else if (event.type === Event.RemoteStop) {
                await TrackPlayer.pause();
                await TrackPlayer.seekTo(0);
            }
        } catch (error) {
            console.error('Error handling remote event:', error);
        }
    });

    useEffect(() => {
        if (onPlayingStateChange) {
            onPlayingStateChange(playing);
        }
    }, [playing, onPlayingStateChange]);

    const progressPercentage = progress.duration > 0 ? (progress.position / progress.duration) * 100 : 0;

    if (!hymn) {
        return (
            <View style={styles.container}>
                <Text style={styles.statusText}>No hymn provided</Text>
            </View>
        );
    }

    return (
        <View style={styles.playerCard}>
            <ProgressBar
                progress={progress}
                progressPercentage={progressPercentage}
                onSeek={handleSeek}
                disabled={!isPlayerReady || isSeeking}
            />
        </View>
    );
});

const styles = StyleSheet.create({
    playerCard: {
        backgroundColor: 'white',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    container: { alignItems: 'center', justifyContent: 'center', padding: 20 },
    statusText: { fontSize: 16, color: '#666' }
});

export default AudioTrackerPlayer;