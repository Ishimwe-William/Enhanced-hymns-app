import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet, Alert, Platform, Text, TouchableOpacity, ActivityIndicator, AppState } from 'react-native';
import YouTube from 'react-native-youtube-iframe';
import PipHandler from '@videosdk.live/react-native-pip-android';
import { useTheme } from '../../../context/ThemeContext';

const YouTubePiPPlayer = forwardRef(({ youtubeVideoId }, ref) => {
    const [playing, setPlaying] = useState(false);
    const [isPipSupported, setIsPipSupported] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [pipActive, setPipActive] = useState(false);
    const playerRef = useRef(null);
    const pipChangeCallback = useRef(null);
    const { colors } = useTheme().theme;

    useImperativeHandle(ref, () => ({
        enterPiP: async () => {
            if (Platform.OS === 'ios') {
                Alert.alert('iOS PiP', 'Use the native PiP button or swipe home.');
                return;
            }
            if (!isPipSupported) {
                Alert.alert('Not Supported', 'Picture-in-Picture requires Android 8.0+.');
                return;
            }
            if (!playing) {
                Alert.alert('Video Not Playing', 'Start playing video first.');
                return;
            }
            try {
                await PipHandler.enterPipMode(480, 270);
                setPipActive(true);
                // Notify parent component
                if (pipChangeCallback.current) {
                    pipChangeCallback.current(true);
                }
            } catch (error) {
                console.error('PiP failed', error);
                Alert.alert('PiP Error', 'Failed to enter Picture-in-Picture mode');
            }
        },
        togglePlayPause: () => setPlaying(!playing),
        setOnPipChange: (callback) => {
            pipChangeCallback.current = callback;
        },
        getCurrentPipState: () => pipActive,
        resetPipState: () => {
            console.log('Manually resetting PiP state');
            setPipActive(false);
            if (pipChangeCallback.current) {
                pipChangeCallback.current(false);
            }
        },
    }));

    useEffect(() => {
        const checkPipSupport = () => {
            if (Platform.OS === 'android') {
                const supported = Platform.Version >= 26;
                setIsPipSupported(supported);
                if (supported) {
                    PipHandler.setDefaultPipDimensions(480, 270);

                    // Set up PiP event listeners
                    const pipEnterListener = () => {
                        setPipActive(true);
                        if (pipChangeCallback.current) {
                            pipChangeCallback.current(true);
                        }
                    };

                    const pipExitListener = () => {
                        setPipActive(false);
                        if (pipChangeCallback.current) {
                            pipChangeCallback.current(false);
                        }
                    };

                    // Add listeners if the PipHandler supports them
                    if (PipHandler.addPipListener) {
                        PipHandler.addPipListener('enter', pipEnterListener);
                        PipHandler.addPipListener('exit', pipExitListener);

                        return () => {
                            PipHandler.removePipListener('enter', pipEnterListener);
                            PipHandler.removePipListener('exit', pipExitListener);
                        };
                    }
                }
            } else {
                setIsPipSupported(true); // iOS PiP
            }
        };

        const cleanup = checkPipSupport();
        return cleanup;
    }, []);

    // Additional AppState listener for better PiP detection
    useEffect(() => {
        const handleAppStateChange = (nextAppState) => {
            console.log('Player AppState changed:', nextAppState, 'Current PiP:', pipActive);

            if (Platform.OS === 'android') {
                if (nextAppState === 'active') {
                    // Always reset PiP state when coming back to active
                    setTimeout(() => {
                        console.log('Resetting PiP state from player');
                        setPipActive(false);
                        if (pipChangeCallback.current) {
                            pipChangeCallback.current(false);
                        }
                    }, 100);
                }
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription?.remove();
    }, []);

    const onStateChange = (state) => {
        setPlaying(state === 'playing');
    };

    const onReady = () => setIsReady(true);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background || '#000'
        },
        playerContainer: {
            backgroundColor: '#000',
            borderRadius: 8,
            overflow: 'hidden',
            aspectRatio: 16 / 9
        },
        webView: {
            backgroundColor: 'transparent'
        },
        loadingOverlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0,0,0,0.6)',
            justifyContent: 'center',
            alignItems: 'center'
        },
        loadingText: {
            color: '#fff',
            marginTop: 10
        },
    });

    if (!youtubeVideoId)
        return (
            <View style={styles.container}>
                <Text style={{ color: colors.text || '#fff' }}>No video ID provided</Text>
            </View>
        );

    return (
        <View style={styles.container}>
            <View style={styles.playerContainer}>
                <YouTube
                    ref={playerRef}
                    videoId={youtubeVideoId}
                    play={playing}
                    onChangeState={onStateChange}
                    onReady={onReady}
                    height={250}
                    useLocalHTML={true}
                    webViewStyle={styles.webView}
                    initialPlayerParams={{
                        cc_lang_pref: 'us',
                        showClosedCaptions: true,
                        rel: false,
                        modestbranding: 1,
                        playsinline: Platform.OS === 'ios' ? 0 : 1,
                        controls: 1,
                        fs: 1,
                        iv_load_policy: 3,
                    }}
                />
                {!isReady && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#fff" />
                        <Text style={styles.loadingText}>Loading video...</Text>
                    </View>
                )}
            </View>
        </View>
    );
});

export default YouTubePiPPlayer;