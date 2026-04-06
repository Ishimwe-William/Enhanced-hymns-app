import React, {useEffect, useState, forwardRef, useImperativeHandle, useRef} from 'react';
import {Alert} from 'react-native';
import TrackPlayer, {
    State,
    useProgress,
    useTrackPlayerEvents,
    Event,
    useIsPlaying,
} from 'react-native-track-player';
import {setupTrackPlayer, isSetup} from '../../services/TrackPlayerService';
import {useHymns} from "../../context/HymnContext";
import {useTheme} from "../../context/ThemeContext";
import * as FileSystem from 'expo-file-system';
import Constants from "expo-constants";

/**
 * Headless audio player — no UI rendered here.
 * Exposes handlePlayPause / handleStop / handleSeek via ref.
 * Reports progress up via onProgressChange(progress) so the parent
 * can render the ProgressBar wherever / however it likes.
 */
const AudioTrackerPlayer = forwardRef(({hymn, onPlayingStateChange, onProgressChange}, ref) => {
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

    // Bubble progress up so the parent can render the bar
    useEffect(() => {
        if (onProgressChange) onProgressChange(progress);
    }, [progress, onProgressChange]);

    // Check audio availability
    useEffect(() => {
        let isMounted = true;

        const checkAudio = async () => {
            if (!hymn) {
                if (isMounted) { setAudioSource(null); setAudioAvailable(false); }
                return;
            }
            try {
                let source = hymn?.audioUrl;
                let exists = false;
                if (hymn?.localAudioPath) {
                    const info = await FileSystem.getInfoAsync(hymn.localAudioPath);
                    if (info.exists) { source = hymn.localAudioPath; exists = true; }
                }
                if (!isMounted) return;
                if (isOffline) {
                    setAudioSource(exists ? source : null);
                    setAudioAvailable(exists);
                } else {
                    const avail = exists || !!hymn?.audioUrl;
                    setAudioSource(avail ? (exists ? source : hymn.audioUrl) : null);
                    setAudioAvailable(avail);
                }
            } catch (e) {
                console.error('Error determining audio source:', e);
                if (isMounted) { setAudioSource(null); setAudioAvailable(false); }
            }
        };

        const t = setTimeout(checkAudio, 50);
        return () => { isMounted = false; clearTimeout(t); };
    }, [hymn?.firebaseId, hymn?.audioUrl, hymn?.localAudioPath, isOffline]);

    // Load track into player
    useEffect(() => {
        if (!audioSource || !hymn) { setIsPlayerReady(false); return; }
        const hymnId = hymn?.firebaseId || hymn?.number || hymn?.id;

        currentHymnIdRef.current = hymnId;

        const loadTrack = async () => {
            if (isSettingUpRef.current) return;
            isSettingUpRef.current = true;
            try {
                if (!isSetup()) await setupTrackPlayer();
                const idx = await TrackPlayer.getActiveTrackIndex();
                if (idx !== undefined) {
                    const current = await TrackPlayer.getTrack(idx);
                    if (current?.url === audioSource && current?.id === hymnId) {
                        setIsPlayerReady(true);
                        return;
                    }
                }
                await TrackPlayer.reset();
                await TrackPlayer.add({
                    id: hymnId,
                    url: audioSource,
                    title: `${hymn.number} - ${hymn?.title}` || 'Unknown Hymn',
                    artist: Constants.expoConfig.extra.EXPO_PUBLIC_APP_NAME,
                    artwork,
                    duration: 0,
                });
                setIsPlayerReady(true);
            } catch (e) {
                console.error('Failed to setup TrackPlayer:', e);
                setIsPlayerReady(false);
            } finally {
                isSettingUpRef.current = false;
            }
        };
        loadTrack();
    }, [audioSource, artwork, hymn]);

    useEffect(() => () => { currentHymnIdRef.current = null; }, []);

    useEffect(() => {
        if (onPlayingStateChange) onPlayingStateChange(playing);
    }, [playing, onPlayingStateChange]);

    useTrackPlayerEvents([Event.RemotePlay, Event.RemotePause, Event.RemoteStop], async (event) => {
        try {
            if (event.type === Event.RemotePlay)       await TrackPlayer.play();
            else if (event.type === Event.RemotePause) await TrackPlayer.pause();
            else if (event.type === Event.RemoteStop)  { await TrackPlayer.pause(); await TrackPlayer.seekTo(0); }
        } catch (e) { console.error('Remote event error:', e); }
    });

    useImperativeHandle(ref, () => ({
        handlePlayPause: async () => {
            try {
                if (!audioAvailable) {
                    Alert.alert('Audio Unavailable', isOffline
                        ? 'Audio not available offline. Please download this hymn first.'
                        : 'No audio available for this hymn');
                    return;
                }
                if (!isPlayerReady) { if (!audioSource) Alert.alert('Error', 'Player is not ready yet'); return; }
                const state = (await TrackPlayer.getPlaybackState()).state;
                if (state === State.Ended || state === State.Stopped) {
                    await TrackPlayer.seekTo(0); await TrackPlayer.play(); return;
                }
                state === State.Playing ? await TrackPlayer.pause() : await TrackPlayer.play();
            } catch (e) { console.error('handlePlayPause error:', e); }
        },
        handleStop: async () => {
            try {
                if (!isPlayerReady) return;
                await TrackPlayer.pause(); await TrackPlayer.seekTo(0);
            } catch (e) { console.error('handleStop error:', e); }
        },
        handleSeek: async (seekTime) => {
            try {
                if (!isPlayerReady || progress.duration === 0) return;
                setIsSeeking(true);
                await TrackPlayer.seekTo(seekTime);
                setTimeout(() => setIsSeeking(false), 100);
            } catch (e) { console.error('handleSeek error:', e); setIsSeeking(false); }
        },
        isReady: () => isPlayerReady,
        isSeeking: () => isSeeking,
    }));

    // Headless — renders nothing
    return null;
});

export default AudioTrackerPlayer;