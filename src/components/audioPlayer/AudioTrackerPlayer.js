import React, {useEffect, useState, forwardRef, useImperativeHandle} from 'react';
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

const AudioTrackerPlayer = forwardRef(({hymn, onPlayingStateChange}, ref) => {
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const [isSeeking, setIsSeeking] = useState(false);
    const [audioSource, setAudioSource] = useState(null);
    const [audioAvailable, setAudioAvailable] = useState(false);
    const {playing} = useIsPlaying();
    const progress = useProgress();
    const {isOffline} = useHymns();
    const {colors} = useTheme().theme;

    const determineAudioSource = async () => {
        if (!hymn) {
            setAudioSource(null);
            setAudioAvailable(false);
            return;
        }

        try {
            // Check if local audio file exists
            const hasLocalAudio = hymn?.localAudioPath &&
                await FileSystem.getInfoAsync(hymn.localAudioPath).then(info => info.exists);

            if (isOffline) {
                // Offline mode: only use local audio
                if (hasLocalAudio) {
                    setAudioSource(hymn.localAudioPath);
                    setAudioAvailable(true);
                    console.log('Using local audio file:', hymn.localAudioPath);
                } else {
                    setAudioSource(null);
                    setAudioAvailable(false);
                    console.log('No local audio available for offline playback');
                }
            } else {
                // Online mode: prefer local audio, fallback to remote
                if (hasLocalAudio) {
                    setAudioSource(hymn.localAudioPath);
                    setAudioAvailable(true);
                    console.log('Using local audio file (online mode):', hymn.localAudioPath);
                } else if (hymn?.audioUrl) {
                    setAudioSource(hymn.audioUrl);
                    setAudioAvailable(true);
                    console.log('Using remote audio URL:', hymn.audioUrl);
                } else {
                    setAudioSource(null);
                    setAudioAvailable(false);
                    console.log('No audio source available');
                }
            }
        } catch (error) {
            console.error('Error determining audio source:', error);
            setAudioSource(null);
            setAudioAvailable(false);
        }
    };

    // Create track object from hymn prop with determined audio source
    const createTrack = () => {
        if (!audioSource) return null;

        return {
            id: hymn?.firebaseId || hymn?.number || 'default-hymn',
            url: audioSource,
            title: hymn?.title || 'Unknown Hymn',
            artist: '500 Indirimbo Zo Guhimbaza Imana',
            artwork: `https://placehold.co/300x300/${colors.track}/${colors.trackText}/png/?text=${hymn.number}`,
            duration: 0,
        };
    };


    // Setup TrackPlayer service
    const setupPlayerForHymn = async () => {
        try {
            // Ensure TrackPlayer is setup first
            if (!isSetup()) {
                await setupTrackPlayer();
            }

            // Clear existing queue and add new track
            await TrackPlayer.reset();
            if (createTrack.url) {
                await TrackPlayer.add(createTrack);
            }
        } catch (error) {
            console.error('Failed to setup TrackPlayer for hymn:', error);
            throw error;
        }
    };

    // Handle seeking to specific time
    const handleSeek = async (seekTime) => {
        try {
            if (!isPlayerReady || progress.duration === 0) {
                return;
            }

            setIsSeeking(true);
            await TrackPlayer.seekTo(seekTime);

            // Add a small delay to prevent UI jumping
            setTimeout(() => {
                setIsSeeking(false);
            }, 100);
        } catch (error) {
            console.error('Error seeking:', error);
            Alert.alert('Error', 'Failed to seek: ' + error.message);
            setIsSeeking(false);
        }
    };

    // Get appropriate error message based on context
    const getUnavailableMessage = () => {
        if (isOffline) {
            return 'Audio not available offline. Please download this hymn first.';
        }
        return 'No audio available for this hymn';
    };

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
        handlePlayPause: async () => {
            try {
                if (!audioAvailable) {
                    Alert.alert('Audio Unavailable', getUnavailableMessage());
                    return;
                }

                if (!isPlayerReady) {
                    Alert.alert('Error', 'Player is not ready yet');
                    return;
                }

                const playbackState = await TrackPlayer.getPlaybackState();
                if (playbackState.state === State.Playing) {
                    await TrackPlayer.pause();
                } else {
                    await TrackPlayer.play();
                }
            } catch (error) {
                console.error('Error in handlePlayPause:', error);
                Alert.alert('Error', 'Failed to toggle playback: ' + error.message);
            }
        },
        handleStop: async () => {
            try {
                if (!isPlayerReady) {
                    return;
                }

                await TrackPlayer.stop();
                await TrackPlayer.reset();

                const track = createTrack();
                if (track) {
                    await TrackPlayer.add(track);
                    await TrackPlayer.seekTo(0);
                }
            } catch (error) {
                console.error('Error in handleStop:', error);
                Alert.alert('Error', 'Failed to stop playback: ' + error.message);
            }
        },
        handleSeek: handleSeek,
        // Expose audio availability status
        isAudioAvailable: () => audioAvailable,
        getAudioSource: () => audioSource,
    }));

    // Handle remote control events
    useTrackPlayerEvents([Event.RemotePlay, Event.RemotePause, Event.RemoteStop], async (event) => {
        try {
            if (event.type === Event.RemotePlay) {
                await TrackPlayer.play();
            } else if (event.type === Event.RemotePause) {
                await TrackPlayer.pause();
            } else if (event.type === Event.RemoteStop) {
                await TrackPlayer.stop();
                await TrackPlayer.reset();
                if (createTrack.url) {
                    await TrackPlayer.add(createTrack);
                }
                console.log('Notification stop triggered and track re-added');
            }
        } catch (error) {
            console.error('Error handling remote event:', error);
        }
    });

    // Notify parent component of playing state changes
    useEffect(() => {
        if (onPlayingStateChange) {
            onPlayingStateChange(playing);
        }
    }, [playing, onPlayingStateChange]);

    // Notify parent component of playing state changes
    useEffect(() => {
        if (onPlayingStateChange) {
            onPlayingStateChange(playing);
        }
    }, [playing, onPlayingStateChange]);

    // Determine audio source when hymn, offline status, or local audio path changes
    useEffect(() => {
        determineAudioSource();
    }, [hymn?.firebaseId, hymn?.audioUrl, hymn?.localAudioPath, isOffline]);

    // Setup player when audio source is determined
    useEffect(() => {
        if (audioSource) {
            setupPlayerForHymn()
                .then(() => {
                    setIsPlayerReady(true);
                    console.log('Player ready with audio source:', audioSource);
                })
                .catch((error) => {
                    console.error('Failed to setup TrackPlayer:', error);
                    setIsPlayerReady(false);
                });
        } else {
            setIsPlayerReady(false);
            console.log('No audio source available, player not ready');
        }
    }, [audioSource]);

    const progressPercentage = progress.duration > 0 ? (progress.position / progress.duration) * 100 : 0;

    // Show message if no hymn or audio URL
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
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    statusText: {
        fontSize: 16,
        color: '#666',
    }
});

export default AudioTrackerPlayer;
