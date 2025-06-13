import React from 'react';
import { ListItem } from '../ui/ListItem';
import { SwitchItem } from '../ui/SwitchItem';
import SettingsSection from './SettingsSection';
import Alert from '../ui/MyAlert';

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
                disabled={settingsLoading || downloadingHymns}
            />
            <ListItem
                icon="download"
                title={localHymnCount > 0 && preferences.offlineDownload ? 'Update Offline Hymns' : 'Download All Hymns'}
                subtitle={
                    localHymnCount > 0 && preferences.offlineDownload
                        ? 'Refresh your offline hymns with updates'
                        : 'Download all hymns for offline use'
                }
                onPress={handleManualDownload}
                disabled={settingsLoading || downloadingHymns || isOffline}
            />
            {localHymnCount > 0 && (
                <ListItem
                    icon="trash"
                    title="Clear Offline Data"
                    subtitle={getStorageInfo()}
                    onPress={handleClearOfflineData}
                    disabled={settingsLoading || downloadingHymns}
                />
            )}
        </SettingsSection>
    );
};

export default OfflineStorageSettings;
