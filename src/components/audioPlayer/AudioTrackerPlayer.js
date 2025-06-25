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

const AudioTrackerPlayer = forwardRef(({hymn, onPlayingStateChange}, ref) => {
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const [isSeeking, setIsSeeking] = useState(false);
    const {playing} = useIsPlaying();
    const progress = useProgress();
    const {isOffline} = useHymns();

    // Create track object from hymn prop
    const track = {
        id: hymn?.firebaseId || hymn?.number || 'default-hymn',
        url: hymn?.audioUrl,
        title: hymn?.title || 'Unknown Hymn',
        artist: '500 Indirimbo Zo Guhimbaza Imana',
        artwork: 'https://via.placeholder.com/300x300.png?text=Music',
        duration: 0,
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
            if (track.url) {
                await TrackPlayer.add(track);
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

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
        handlePlayPause: async () => {
            try {
                if (isOffline) {
                    Alert.alert('Offline Mode', 'Cannot play audio while offline');
                    return;
                }
                if (!track.url) {
                    Alert.alert('Error', 'No audio URL available for this hymn');
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
                if (track.url) {
                    await TrackPlayer.add(track);
                    await TrackPlayer.seekTo(0);
                }
            } catch (error) {
                console.error('Error in handleStop:', error);
                Alert.alert('Error', 'Failed to stop playback: ' + error.message);
            }
        },
        handleSeek: handleSeek, // Expose seek method
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
                if (track.url) {
                    await TrackPlayer.add(track);
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

    useEffect(() => {
        if (hymn?.audioUrl) {
            setupPlayerForHymn()
                .then(() => {
                    setIsPlayerReady(true);
                })
                .catch((error) => {
                    console.error('Failed to setup TrackPlayer:', error);
                    setIsPlayerReady(false);
                });
        } else {
            setIsPlayerReady(false);
        }
    }, [hymn?.audioUrl, hymn?.firebaseId]); // Re-setup when hymn changes

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
