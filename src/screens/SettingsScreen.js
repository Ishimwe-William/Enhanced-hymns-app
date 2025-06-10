import React, {useEffect, useMemo, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, Alert} from 'react-native';
import {useNavigation, DrawerActions} from '@react-navigation/native';
import Header from '../components/ui/Header';
import {usePreferences} from '../context/PreferencesContext';
import {useUser} from '../context/UserContext';
import {useHymns} from '../context/HymnContext';
import WarningBanner from "../components/ui/WarningBanner";
import {ListItem} from "../components/ui/ListItem";
import {SwitchItem} from "../components/ui/SwitchItem";
import {useTheme} from "../context/ThemeContext";

const SettingsScreen = () => {
    const navigation = useNavigation();
    const {theme, themeMode, toggleTheme} = useTheme();
    const colors = theme.colors;
    const {signIn} = useUser();

    const {
        preferences,
        updatePreference,
        updateNestedPreference,
        handleForceSyncWithCloud,
        resetPreferences,
        isLoggedIn,
        syncing,
        loading,
        dbInitialized,
    } = usePreferences();

    const { forceSync, syncHymns, setSyncing, isOffline, clearAllHymns, getLocalHymnCount } = useHymns();

    const [settingsLoading, setSettingsLoading] = useState(false);
    const [downloadingHymns, setDownloadingHymns] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(null);
    const [localHymnCount, setLocalHymnCount] = useState(0);

    useEffect(() => {
        if (preferences.theme && preferences.theme !== themeMode) {
            toggleTheme();
        }
    }, [preferences.theme]);

    // Load local hymn count on component mount
    useEffect(() => {
        loadLocalHymnCount();
    }, []);

    const loadLocalHymnCount = async () => {
        try {
            const count = await getLocalHymnCount();
            setLocalHymnCount(count);
        } catch (error) {
            console.error('Error loading local hymn count:', error);
            setLocalHymnCount(0);
        }
    };

    const handleMenuPress = () => {
        navigation.dispatch(DrawerActions.openDrawer());
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const handleFontSizeChange = async () => {
        try {
            const sizes = ['small', 'medium', 'large'];
            const currentIndex = sizes.indexOf(preferences.fontSize);
            const nextIndex = (currentIndex + 1) % sizes.length;
            await updatePreference('fontSize', sizes[nextIndex]);
        } catch (error) {
            Alert.alert('Error', 'Failed to update font size');
        }
    };

    const handleThemeChange = async () => {
        try {
            toggleTheme();
            const newTheme = preferences.theme === 'light' ? 'dark' : 'light';
            await updatePreference('theme', newTheme);
        } catch (error) {
            Alert.alert('Error', 'Failed to update theme');
        }
    };

    const handleSyncWithCloud = async () => {
        if (!isLoggedIn) {
            Alert.alert('Sign In Required', 'Please sign in to sync with cloud');
            return;
        }

        if (isOffline) {
            Alert.alert(
                'No Internet Connection',
                'Please connect to the internet to sync with cloud'
            );
            return;
        }

        try {
            setSettingsLoading(true);
            const success = await handleForceSyncWithCloud();
            if (success) {
                Alert.alert('Success', 'Settings synced from cloud successfully');
            } else {
                Alert.alert('Info', 'No cloud settings found or settings are up to date');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to sync with cloud: ' + error.message);
        } finally {
            setSettingsLoading(false);
        }
    };

    const handleResetSettings = () => {
        Alert.alert(
            'Reset Settings',
            'Are you sure you want to reset all settings to defaults? This will also clear local database preferences.',
            [
                {text: 'Cancel', style: 'cancel'},
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setSettingsLoading(true);
                            await resetPreferences();
                            Alert.alert('Success', 'Settings have been reset to defaults');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to reset settings: ' + error.message);
                        } finally {
                            setSettingsLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const downloadAllHymns = async () => {
        if (isOffline) {
            Alert.alert(
                'No Internet Connection',
                'Please connect to the internet to download hymns.'
            );
            return false;
        }
        try {
            setDownloadingHymns(true);
            setDownloadProgress('Starting download...');
            const success = await forceSync(hymns => setHymns(hymns), setSyncing, isOffline, setDownloadProgress);
            if (success) {
                await loadLocalHymnCount();
                await updatePreference('offlineDownload', true);
                setTimeout(() => setDownloadProgress(null), 2000);
                return true;
            } else {
                throw new Error('Failed to download hymns');
            }
        } catch (error) {
            console.error('Error downloading hymns:', error);
            setDownloadProgress(null);
            Alert.alert('Download Failed', error.message || 'Failed to download hymns');
            return false;
        } finally {
            setDownloadingHymns(false);
        }
    };

    const updateOfflineHymns = async () => {
        if (isOffline) {
            Alert.alert('Offline', 'Please connect to the internet to update hymns.');
            return false;
        }
        if (!preferences.offlineDownload) {
            Alert.alert('Offline Download Disabled', 'Please enable offline download to update hymns.');
            return false;
        }
        try {
            setDownloadingHymns(true);
            setDownloadProgress('Checking for updates...');
            const success = await syncHymns(true, setSyncing, hymns => setHymns(hymns));
            if (success !== false) {
                await loadLocalHymnCount();
                setTimeout(() => setDownloadProgress(null), 2000);
                return true;
            } else {
                throw new Error('Failed to update hymns');
            }
        } catch (error) {
            console.error('Error updating hymns:', error);
            setDownloadProgress(null);
            Alert.alert('Update Failed', error.message || 'Failed to update hymns');
            return false;
        } finally {
            setDownloadingHymns(false);
        }
    };

    const clearOfflineHymns = async () => {
        try {
            setSettingsLoading(true);
            await clearAllHymns();
            await loadLocalHymnCount();
            Alert.alert('Success', 'All offline hymns have been cleared');
        } catch (error) {
            console.error('Error clearing offline hymns:', error);
            Alert.alert('Error', 'Failed to clear offline hymns');
        } finally {
            setSettingsLoading(false);
        }
    };

    const handleOfflineDownloadToggle = async (value) => {
        try {
            if (value) {

                if (isOffline) {
                    Alert.alert(
                        'No Internet Connection',
                        'Please connect to the internet to enable offline download and download hymns.'
                    );
                    return;
                }

                if (localHymnCount === 0) {
                    Alert.alert(
                        'Download All Hymns',
                        'This will download all hymns for offline use. This may take some time and use data. Continue?',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            {
                                text: 'Download',
                                onPress: async () => {
                                    const downloadSuccess = await downloadAllHymns();
                                    if (downloadSuccess) {
                                        Alert.alert('Download Complete', 'All hymns are now available offline!');
                                    }
                                },
                            },
                        ]
                    );
                } else {
                    await updatePreference('offlineDownload', true);
                    Alert.alert('Offline Download Enabled', 'You can now update your offline hymns or keep them as is.');
                }
            } else {
                Alert.alert(
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
                                await clearOfflineHymns();
                                await updatePreference('offlineDownload', false);
                            },
                        },
                    ]
                );
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update offline download setting');
        }
    };

    const handleManualDownload = async () => {
        if (isOffline) {
            Alert.alert('Offline', 'Please connect to the internet to download hymns.');
            return;
        }
        if (localHymnCount > 0 && preferences.offlineDownload) {
            Alert.alert(
                'Update Offline Hymns',
                `This will update your ${localHymnCount} offline hymns with the latest versions. Continue?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Update',
                        onPress: async () => {
                            const success = await updateOfflineHymns();
                            if (success) {
                                Alert.alert('Update Complete', 'Your offline hymns have been updated!');
                            }
                        },
                    },
                ]
            );
        } else {
            Alert.alert(
                'Download All Hymns',
                'This will download all hymns for offline use. Continue?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Download',
                        onPress: async () => {
                            const success = await downloadAllHymns();
                            if (success) {
                                Alert.alert('Download Complete', 'All hymns are now available offline!');
                            }
                        },
                    },
                ]
            );
        }
    };

    const handleClearOfflineData = () => {
        if (localHymnCount === 0) {
            Alert.alert('No Data', 'No offline hymns to clear');
            return;
        }

        Alert.alert(
            'Clear Offline Data',
            `This will remove all ${localHymnCount} offline hymns to free up storage space. You can download them again later. Continue?`,
            [
                {text: 'Cancel', style: 'cancel'},
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: clearOfflineHymns
                }
            ]
        );
    };

    const formatFontSize = (size) => {
        return size.charAt(0).toUpperCase() + size.slice(1);
    };

    const formatTheme = (theme) => {
        return theme.charAt(0).toUpperCase() + theme.slice(1);
    };

    const getOfflineStatus = () => {
        if (downloadingHymns) {
            return downloadProgress || 'Downloading...';
        }
        if (localHymnCount > 0) {
            return `${localHymnCount} hymns available offline`;
        }
        return 'No hymns downloaded';
    };

    const getStorageInfo = () => {
        if (localHymnCount === 0) return 'No storage used';
        const estimatedSize = Math.round((localHymnCount * 2.5) / 1024 * 100) / 100; // Rough estimate
        return `~${estimatedSize}MB used`;
    };

    const styles = useMemo(() => {
        return StyleSheet.create({
            container: {
                flex: 1,
                backgroundColor: colors.card
            },
            content: {
                flex: 1,
            },
            section: {
                marginVertical: 22,
                marginHorizontal: 16,
            },
            sectionTitle: {
                fontSize: 14,
                fontWeight: '600',
                color: colors.textSecondary,
                marginBottom: 8,
                marginLeft: 16,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
            },
            loadingContainer: {
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: colors.card
            },
            loadingText: {
                marginTop: 16,
                fontSize: 16,
                color: colors.text
            }
        });
    }, [colors])

    // Show loading screen while database is initializing
    if (!dbInitialized || loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading Settings...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header
                title="Settings"
                showMenu
                onBack={handleBack}
                onMenu={handleMenuPress}
                showMore={false}
            />
            <ScrollView style={styles.content}>
                {!isLoggedIn && (
                    <WarningBanner
                        message={"Sign in to save your settings across devices"}
                        signIn={signIn}
                    />
                )}

                {syncing && (
                    <WarningBanner
                        icon={"sync"}
                        message={"Syncing settings with cloud..."}
                    />
                )}

                {downloadingHymns && (
                    <WarningBanner
                        icon={"cloud-download"}
                        message={downloadProgress || "Downloading hymns for offline use..."}
                    />
                )}

                {settingsLoading && (
                    <WarningBanner
                        icon={"update"}
                        message={"Updating settings..."}
                    />
                )}

                {isOffline && (
                    <WarningBanner
                        icon={"wifi-off"}
                        message={"You are currently offline"}
                    />
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Display</Text>
                    <ListItem
                        icon="text"
                        title="Font Size"
                        subtitle={formatFontSize(preferences.fontSize)}
                        onPress={handleFontSizeChange}
                        disabled={settingsLoading}
                    />
                    <ListItem
                        icon="color-palette"
                        title="Theme"
                        subtitle={formatTheme(preferences.theme)}
                        onPress={handleThemeChange}
                        disabled={settingsLoading}
                    />
                    <SwitchItem
                        icon="musical-notes"
                        title="Show Chords"
                        subtitle="Display chord notations"
                        value={preferences.display.showChords}
                        onValueChange={(value) => updateNestedPreference('display', 'showChords', value)}
                        disabled={settingsLoading}
                    />
                    <SwitchItem
                        icon="list"
                        title="Show Verse Numbers"
                        subtitle="Display verse numbering"
                        value={preferences.display.showVerseNumbers}
                        onValueChange={(value) => updateNestedPreference('display', 'showVerseNumbers', value)}
                        disabled={settingsLoading}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Offline Storage</Text>
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
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Data & Sync</Text>

                    {isLoggedIn && (
                        <>
                            <SwitchItem
                                icon="sync"
                                title="Sync Favorites"
                                subtitle="Backup your favorites to cloud"
                                value={preferences.syncFavorites}
                                onValueChange={(value) => updatePreference('syncFavorites', value)}
                                disabled={settingsLoading}
                            />
                            <ListItem
                                icon="cloud-download"
                                title="Sync from Cloud"
                                subtitle="Download latest settings from cloud"
                                onPress={handleSyncWithCloud}
                                disabled={settingsLoading || syncing}
                            />
                        </>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notifications</Text>
                    <SwitchItem
                        icon="notifications"
                        title="Enable Notifications"
                        subtitle="Receive app notifications"
                        value={preferences.notifications.enabled}
                        onValueChange={(value) => updateNestedPreference('notifications', 'enabled', value)}
                        disabled={settingsLoading}
                    />
                    <SwitchItem
                        icon="alarm"
                        title="Daily Reminder"
                        subtitle="Daily hymn reminder"
                        value={preferences.notifications.dailyReminder}
                        onValueChange={(value) => updateNestedPreference('notifications', 'dailyReminder', value)}
                        disabled={settingsLoading}
                    />
                    <SwitchItem
                        icon="add-circle"
                        title="New Hymns"
                        subtitle="Notify about new hymns"
                        value={preferences.notifications.newHymns}
                        onValueChange={(value) => updateNestedPreference('notifications', 'newHymns', value)}
                        disabled={settingsLoading}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <ListItem
                        icon="refresh"
                        title="Reset Settings"
                        subtitle="Reset all settings to defaults"
                        onPress={handleResetSettings}
                        disabled={settingsLoading}
                    />
                </View>
            </ScrollView>
        </View>
    );
};

export default SettingsScreen;
