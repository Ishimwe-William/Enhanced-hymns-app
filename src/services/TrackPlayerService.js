import TrackPlayer, { Capability, AppKilledPlaybackBehavior } from 'react-native-track-player';

let isTrackPlayerSetup = false;

export const setupTrackPlayer = async () => {
    if (isTrackPlayerSetup) {
        return;
    }

    try {
        await TrackPlayer.setupPlayer();

        await TrackPlayer.updateOptions({
            android: {
                appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
            },
            capabilities: [
                Capability.Play,
                Capability.Pause,
                Capability.Stop,
                Capability.SeekTo,
            ],
            compactCapabilities: [
                Capability.Play,
                Capability.Pause,
                Capability.Stop,
            ],
            notificationCapabilities: [
                Capability.Play,
                Capability.Pause,
                Capability.Stop,
            ],
            progressUpdateEventInterval: 1,
        });

        isTrackPlayerSetup = true;
        console.log('TrackPlayer setup completed successfully');
    } catch (error) {
        console.error('Error setting up TrackPlayer:', error);
        isTrackPlayerSetup = false;
        throw error;
    }
};

export const isSetup = () => isTrackPlayerSetup;

export const resetSetupFlag = () => {
    isTrackPlayerSetup = false;
};
