import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Modal, useWindowDimensions, Platform, AppState } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import FloatingButton from '../ui/FloatingButton';
import YouTubePiPPlayer from '../hymns/detail/YouTubePiPPlayer';
import { MaterialIcons } from '@expo/vector-icons';
import { usePipModeListener } from '@videosdk.live/react-native-pip-android';

const YouTubeModal = ({ visible, onClose, youtubeVideoId }) => {
    const { colors } = useTheme().theme;
    const playerRef = useRef();
    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;

    // Multiple ways to track PiP state for better reliability
    const pipActive = usePipModeListener();
    const [localPipActive, setLocalPipActive] = useState(false);
    const [appState, setAppState] = useState(AppState.currentState);

    // Track app state changes (useful for detecting PiP on some devices)
    useEffect(() => {
        const handleAppStateChange = (nextAppState) => {
            setAppState(nextAppState);
            console.log('App state changed:', nextAppState, 'Local PiP:', localPipActive);

            // Reset PiP state when app becomes active
            if (nextAppState === 'active') {
                // Small delay to ensure proper state reset
                setTimeout(() => {
                    setLocalPipActive(false);
                    console.log('Reset local PiP state to false');
                }, 200);
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription?.remove();
    }, []);

    // Set up PiP change callback on the player
    useEffect(() => {
        if (playerRef.current && visible) {
            playerRef.current.setOnPipChange?.((pipState) => {
                console.log('Player PiP callback:', pipState);
                setLocalPipActive(pipState);
            });
        }
    }, [playerRef.current, visible]);

    // Reset PiP state when modal becomes visible
    useEffect(() => {
        if (visible) {
            setLocalPipActive(false);
            // Also reset the player's PiP state
            setTimeout(() => {
                playerRef.current?.resetPipState?.();
            }, 100);
            console.log('Modal opened, reset PiP state');
        }
    }, [visible]);

    // Combined PiP state - true if either detection method indicates PiP is active
    const isPipModeActive = pipActive || localPipActive;

    console.log('Render state - pipActive:', pipActive, 'localPipActive:', localPipActive, 'isPipModeActive:', isPipModeActive);

    const styles = StyleSheet.create({
        youtubeModal: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.9)'
        },
        youtubeContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: isLandscape ? 10 : 20
        },
        videoWrapper: {
            width: isLandscape ? width : width - 40,
            aspectRatio: 16 / 9,
            borderRadius: 8,
            overflow: 'hidden',
            backgroundColor: '#000'
        },
        closeButtonContainer: {
            position: 'absolute',
            top: Platform.OS === 'ios' ? 60 : 40,
            right: 20,
            zIndex: 1000,
            backgroundColor: colors.primary,
            borderRadius: 25,
            width: 50,
            height: 50,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
        },
        pipButtonContainer: {
            position: 'absolute',
            top: Platform.OS === 'ios' ? 60 : 40,
            left: 20,
            zIndex: 1000,
            backgroundColor: colors.primary,
            borderRadius: 25,
            width: 50,
            height: 50,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
        },
    });

    if (!youtubeVideoId) return null;

    const handlePipPress = async () => {
        try {
            await playerRef.current?.enterPiP();
            // Manually set local PiP state as backup
            setTimeout(() => setLocalPipActive(true), 100);
        } catch (error) {
            console.error('Failed to enter PiP mode:', error);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="fullScreen"
            onRequestClose={onClose}
        >
            <View style={styles.youtubeModal}>
                {/* Only show buttons when NOT in PiP mode */}
                {!isPipModeActive && (
                    <>
                        {/* Close Button */}
                        <View style={styles.closeButtonContainer}>
                            <FloatingButton
                                name="close"
                                size={24}
                                color={colors.text}
                                onPress={onClose}
                            />
                        </View>

                        {/* PiP Button - Android only */}
                        {Platform.OS === 'android' && (
                            <View style={styles.pipButtonContainer}>
                                <FloatingButton onPress={handlePipPress}>
                                    <MaterialIcons
                                        name="picture-in-picture"
                                        color={colors.text}
                                        size={24}
                                    />
                                </FloatingButton>
                            </View>
                        )}
                    </>
                )}

                <View style={styles.youtubeContainer}>
                    <View style={styles.videoWrapper}>
                        <YouTubePiPPlayer
                            ref={playerRef}
                            youtubeVideoId={youtubeVideoId}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default YouTubeModal;