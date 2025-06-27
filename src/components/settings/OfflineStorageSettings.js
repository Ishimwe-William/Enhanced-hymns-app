import React, { useState, useEffect } from 'react';
import { ListItem } from '../ui/ListItem';
import { SwitchItem } from '../ui/SwitchItem';
import SettingsSection from './SettingsSection';
import Alert from '../ui/MyAlert';
import {
    getLocalTunesCount,
    downloadAllTunes,
    updateAllTunes,
    clearAllTunes,
    getTunesDownloadInfo
} from "../../services/localHymnService";

const OfflineStorageSettings = ({
                                    preferences,
                                    updatePreference,
                                    settingsLoading,
                                    downloadingHymns,
                                    isOffline,
                                    localHymnCount,
                                    onDownloadAllHymns,
                                    onUpdateOfflineHymns,
                                    onClearOfflineHymns
                                }) => {
    const [tunesCount, setTunesCount] = useState(0);
    const [downloadingTunes, setDownloadingTunes] = useState(false);
    const [tunesProgress, setTunesProgress] = useState({ current: 0, total: 0 });

    // Load tunes count on mount and when relevant data changes
    useEffect(() => {
        const loadTunesCount = async () => {
            try {
                const count = await getLocalTunesCount();
                setTunesCount(count);
            } catch (error) {
                console.error('Error loading tunes count:', error);
                setTunesCount(0);
            }
        };

        loadTunesCount();
    }, [localHymnCount, downloadingHymns, downloadingTunes]);

    const getOfflineStatus = () => {
        if (downloadingHymns) {
            return 'Downloading...';
        }
        if (localHymnCount > 0) {
            return `${localHymnCount} hymns available offline`;
        }
        return 'No hymns downloaded';
    };

    const getStorageInfo = () => {
        if (localHymnCount === 0) return 'No storage used';
        const estimatedSize = Math.round((localHymnCount * 2.5) / 1024 * 100) / 100;
        return `~${estimatedSize}MB used`;
    };

    const getTunesStatus = () => {
        if (downloadingTunes) {
            return `Downloading tunes... (${tunesProgress.current}/${tunesProgress.total})`;
        }
        return `${tunesCount} tunes downloaded`;
    };

    const handleOfflineTunesToggle = async (value) => {
        try {
            if (value) {
                if (isOffline) {
                    Alert.error('Please connect to the internet to download tunes.');
                    return;
                }

                // Check if there are tunes to download
                const tunesInfo = await getTunesDownloadInfo();

                if (tunesInfo.total === 0) {
                    Alert.info('No hymns have audio tunes available for download.');
                    return;
                }

                if (tunesInfo.remaining === 0) {
                    await updatePreference('offlineTunes', true);
                    Alert.success('All available tunes are already downloaded!');
                    return;
                }

                Alert.confirm(
                    'Download Tunes',
                    `This will download ${tunesInfo.remaining} audio tunes for offline playback. This may take some time and use significant data. Continue?`,
                    async () => {
                        setDownloadingTunes(true);
                        try {
                            const result = await downloadAllTunes((current, total, hymnTitle) => {
                                setTunesProgress({ current, total });
                            });

                            await updatePreference('offlineTunes', true);
                            Alert.success(`Downloaded ${result.downloaded} tunes successfully!`);
                        } catch (error) {
                            Alert.error('Failed to download tunes');
                        } finally {
                            setDownloadingTunes(false);
                            setTunesProgress({ current: 0, total: 0 });
                        }
                    }
                );
            } else {
                Alert.show(
                    'Disable Offline Tunes',
                    'Do you want to keep the downloaded tunes or clear them to free up space?',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Keep Tunes',
                            onPress: async () => {
                                await updatePreference('offlineTunes', false);
                            },
                        },
                        {
                            text: 'Clear Tunes',
                            style: 'destructive',
                            onPress: async () => {
                                try {
                                    await clearAllTunes();
                                    await updatePreference('offlineTunes', false);
                                    Alert.success('All tunes cleared successfully!');
                                } catch (error) {
                                    Alert.error('Failed to clear tunes');
                                }
                            },
                        },
                    ]
                );
            }
        } catch (error) {
            Alert.error('Failed to update offline tunes setting');
        }
    };

    const handleOfflineDownloadToggle = async (value) => {
        try {
            if (value) {
                if (isOffline) {
                    Alert.error('Please connect to the internet to enable offline download and download hymns.');
                    return;
                }

                if (localHymnCount === 0) {
                    Alert.confirm(
                        'Download All Hymns',
                        'This will download all hymns for offline use. This may take some time and use data. Continue?',
                        async () => {
                            const downloadSuccess = await onDownloadAllHymns();
                            if (downloadSuccess) {
                                Alert.success('All hymns are now available offline!');
                            }
                        }
                    );
                } else {
                    await updatePreference('offlineDownload', true);
                    Alert.info('You can now update your offline hymns or keep them as is.');
                }
            } else {
                Alert.show(
                    'Disable Offline Download',
                    'Do you want to keep the downloaded hymns or clear them to free up space?',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Keep Hymns',
                            onPress: async () => {
                                await updatePreference('offlineDownload', false);
                            },
                        },
                        {
                            text: 'Clear Hymns',
                            style: 'destructive',
                            onPress: async () => {
                                await onClearOfflineHymns();
                                await updatePreference('offlineDownload', false);
                            },
                        },
                    ]
                );
            }
        } catch (error) {
            Alert.error('Failed to update offline download setting');
        }
    };

    const handleManualDownload = async () => {
        if (isOffline) {
            Alert.error('Please connect to the internet to download hymns.');
            return;
        }

        if (localHymnCount > 0 && preferences.offlineDownload) {
            Alert.confirm(
                'Update Offline Hymns',
                `This will update your ${localHymnCount} offline hymns with the latest versions. Continue?`,
                async () => {
                    const success = await onUpdateOfflineHymns();
                    if (success) {
                        Alert.success('Your offline hymns have been updated!');
                    }
                }
            );
        } else {
            Alert.confirm(
                'Download All Hymns',
                'This will download all hymns for offline use. Continue?',
                async () => {
                    const success = await onDownloadAllHymns();
                    if (success) {
                        Alert.success('All hymns are now available offline!');
                    }
                }
            );
        }
    };

    const handleUpdateTunes = async () => {
        if (isOffline) {
            Alert.error('Please connect to the internet to update tunes.');
            return;
        }

        Alert.confirm(
            'Update All Tunes',
            'This will re-download all tunes to ensure you have the latest versions. Continue?',
            async () => {
                setDownloadingTunes(true);
                try {
                    const result = await updateAllTunes((current, total, hymnTitle) => {
                        setTunesProgress({ current, total });
                    });

                    Alert.success(`Updated ${result.updated} tunes successfully!`);
                } catch (error) {
                    Alert.error('Failed to update tunes');
                } finally {
                    setDownloadingTunes(false);
                    setTunesProgress({ current: 0, total: 0 });
                }
            }
        );
    };

    const handleClearOfflineData = () => {
        if (localHymnCount === 0) {
            Alert.info('No offline hymns to clear');
            return;
        }

        Alert.destructiveConfirm(
            'Clear Offline Data',
            `This will remove all ${localHymnCount} offline hymns to free up storage space. You can download them again later. Continue?`,
            onClearOfflineHymns,
            null,
            'Clear'
        );
    };

    return (
        <SettingsSection title="Offline Storage">
            <SwitchItem
                icon="cloud-download"
                title="Enable Offline Download"
                subtitle={getOfflineStatus()}
                value={preferences.offlineDownload}
                onValueChange={handleOfflineDownloadToggle}
                disabled={settingsLoading || downloadingHymns || downloadingTunes}
            />

            {preferences.offlineDownload && (
                <SwitchItem
                    icon="musical-notes"
                    title="Include Tunes in Offline Download"
                    subtitle={getTunesStatus()}
                    value={preferences.offlineTunes}
                    onValueChange={handleOfflineTunesToggle}
                    disabled={settingsLoading || downloadingHymns || downloadingTunes}
                />
            )}

            <ListItem
                icon="download"
                title={localHymnCount > 0 && preferences.offlineDownload ? 'Update Offline Hymns' : 'Download All Hymns'}
                subtitle={
                    localHymnCount > 0 && preferences.offlineDownload
                        ? 'Refresh your offline hymns with updates'
                        : 'Download all hymns for offline use'
                }
                onPress={handleManualDownload}
                disabled={settingsLoading || downloadingHymns || downloadingTunes || isOffline}
            />

            {preferences.offlineTunes && tunesCount > 0 && (
                <ListItem
                    icon="refresh"
                    title="Update All Tunes"
                    subtitle="Re-download all tunes to get latest versions"
                    onPress={handleUpdateTunes}
                    disabled={settingsLoading || downloadingHymns || downloadingTunes || isOffline}
                />
            )}

            {localHymnCount > 0 && (
                <ListItem
                    icon="trash"
                    title="Clear Offline Data"
                    subtitle={getStorageInfo()}
                    onPress={handleClearOfflineData}
                    disabled={settingsLoading || downloadingHymns || downloadingTunes}
                />
            )}
        </SettingsSection>
    );
};

export default OfflineStorageSettings;
