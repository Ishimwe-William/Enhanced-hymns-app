import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet, Alert, Platform, Text, ActivityIndicator, AppState } from 'react-native';
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

            // FIX 1: Prevent "Black Hole" minimization if video isn't loaded yet
            if (!isReady) {
                Alert.alert('Please Wait', 'Video is still loading...');
                return;
            }

            // FIX 2: Auto-play if paused (instead of error)
            // We play, wait a moment for the video to wake up, then enter PiP.
            if (!playing) {
                setPlaying(true);

                // Wait 500ms to ensure video starts rendering before minimizing app
                setTimeout(async () => {
                    try {
                        await PipHandler.enterPipMode(480, 270);
                        setPipActive(true);
                        if (pipChangeCallback.current) {
                            pipChangeCallback.current(true);
                        }
                    } catch (error) {
                        console.error('PiP failed after autoplay', error);
                    }
                }, 500);
                return;
            }

            // Normal Entry (Already playing)
            try {
                await PipHandler.enterPipMode(480, 270);
                setPipActive(true);
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

    useEffect(() => {
        const handleAppStateChange = (nextAppState) => {
            if (Platform.OS === 'android') {
                if (nextAppState === 'active') {
                    // Slight delay to ensure UI is ready before resetting state
                    setTimeout(() => {
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
        if (state === 'ended') {
            setPlaying(false);
        } else if (state === 'playing') {
            setPlaying(true);
        } else if (state === 'paused') {
            setPlaying(false);
        }
    };

    const onError = (error) => {
        console.error("YouTube Player Error:", error);
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
                    onError={onError}
                    height={250}
                    // KEY CONFIGS FOR STABILITY & ERROR 153
                    webViewStyle={{ opacity: 0.99, backgroundColor: 'black' }}
                    webViewProps={{
                        androidLayerType: 'hardware',
                        startInLoadingState: true,
                        renderToHardwareTextureAndroid: true,
                    }}
                    initialPlayerParams={{
                        cc_lang_pref: 'us',
                        showClosedCaptions: true,
                        rel: false,
                        modestbranding: 1,
                        playsinline: 1,
                        controls: 1,
                        origin: 'https://www.youtube.com', // Fixes Error 153
                        preventFullScreen: false,
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