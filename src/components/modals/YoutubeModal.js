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

    // Tracker 1: Native PiP listener (from library)
    const pipActive = usePipModeListener();

    // Tracker 2: Local state (from Player callback)
    const [localPipActive, setLocalPipActive] = useState(false);
    const [appState, setAppState] = useState(AppState.currentState);

    // Track app state to reset PiP when returning to foreground
    useEffect(() => {
        const handleAppStateChange = (nextAppState) => {
            setAppState(nextAppState);
            // Reset local PiP state when app becomes active again
            if (nextAppState === 'active') {
                setTimeout(() => {
                    setLocalPipActive(false);
                }, 200);
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription?.remove();
    }, []);

    // LISTEN TO PLAYER STATE
    // This is the reliable way to know when to hide buttons
    useEffect(() => {
        if (playerRef.current && visible) {
            playerRef.current.setOnPipChange?.((pipState) => {
                setLocalPipActive(pipState);
            });
        }
    }, [playerRef.current, visible]);

    // Reset state when modal opens
    useEffect(() => {
        if (visible) {
            setLocalPipActive(false);
            // Reset player internal state
            setTimeout(() => {
                playerRef.current?.resetPipState?.();
            }, 100);
        }
    }, [visible]);

    const isPipModeActive = pipActive || localPipActive;

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
        // Buttons are positioned absolutely
        buttonContainer: {
            position: 'absolute',
            top: Platform.OS === 'ios' ? 60 : 40,
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
        closePos: { right: 20 },
        pipPos: { left: 20 },
    });

    if (!youtubeVideoId) return null;

    const handlePipPress = async () => {
        try {
            // FIX: Don't set state manually here.
            // Let the Player callback trigger setLocalPipActive(true)
            // This prevents buttons from vanishing if PiP fails/waits.
            await playerRef.current?.enterPiP();
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
                        <View style={[styles.buttonContainer, styles.closePos]}>
                            <FloatingButton
                                name="close"
                                size={24}
                                color={colors.text}
                                onPress={onClose}
                            />
                        </View>

                        {/* PiP Button - Android only */}
                        {Platform.OS === 'android' && (
                            <View style={[styles.buttonContainer, styles.pipPos]}>
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