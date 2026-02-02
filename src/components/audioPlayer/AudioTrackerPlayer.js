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
    const [audioSource, setAudioSource] = useState(undefined);
    const [audioAvailable, setAudioAvailable] = useState(false);

    const {playing} = useIsPlaying();
    const progress = useProgress();
    const {isOffline} = useHymns();
    const {artwork} = useTheme().theme;

    const isSettingUpRef = useRef(false);
    const currentHymnIdRef = useRef(null);

    // Check audio availability
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
                let source = hymn?.audioUrl;
                let exists = false;

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

        const timer = setTimeout(checkAudio, 50);

        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [hymn?.firebaseId, hymn?.audioUrl, hymn?.localAudioPath, isOffline]);

    // Setup player and handle hymn changes
    useEffect(() => {
        if (!audioSource || !hymn) {
            setIsPlayerReady(false);
            return;
        }

        const hymnId = hymn?.firebaseId || hymn?.number || hymn?.id;

        // CRITICAL FIX: Detect hymn change and stop playback
        if (currentHymnIdRef.current !== null && currentHymnIdRef.current !== hymnId) {
            // Hymn changed - immediately stop and reset
            const stopPrevious = async () => {
                try {
                    await TrackPlayer.pause();
                    await TrackPlayer.seekTo(0);
                    setIsPlayerReady(false);
                } catch (error) {
                    console.error('Error stopping previous track:', error);
                }
            };
            stopPrevious();
        }

        currentHymnIdRef.current = hymnId;

        const loadTrack = async () => {
            if (isSettingUpRef.current) return;
            isSettingUpRef.current = true;

            try {
                if (!isSetup()) {
                    await setupTrackPlayer();
                }

                const currentTrackIndex = await TrackPlayer.getActiveTrackIndex();
                if (currentTrackIndex !== undefined) {
                    const currentTrack = await TrackPlayer.getTrack(currentTrackIndex);
                    if (currentTrack?.url === audioSource && currentTrack?.id === hymnId) {
                        setIsPlayerReady(true);
                        isSettingUpRef.current = false;
                        return;
                    }
                }

                // Different track - reset and load
                await TrackPlayer.reset();

                const track = {
                    id: hymnId,
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

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            currentHymnIdRef.current = null;
        };
    }, []);

    const handleSeek = async (seekTime) => {
        try {
            if (!isPlayerReady || progress.duration === 0) return;
            setIsSeeking(true);
            await TrackPlayer.seekTo(seekTime);
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
                        // Loading
                    } else {
                        Alert.alert('Error', 'Player is not ready yet');
                    }
                    return;
                }

                const playbackState = await TrackPlayer.getPlaybackState();
                const state = playbackState.state || playbackState;

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
                await TrackPlayer.pause();
                await TrackPlayer.seekTo(0);
            } catch (error) {
                console.error('Error in handleStop:', error);
            }
        },
        handleSeek: handleSeek,
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