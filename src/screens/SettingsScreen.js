import React, {useEffect, useMemo, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {DrawerActions, useNavigation} from '@react-navigation/native';
import Header from '../components/ui/Header';
import {usePreferences} from '../context/PreferencesContext';
import {useUser} from '../context/UserContext';
import {useHymns} from '../context/HymnContext';
import {useTheme} from '../context/ThemeContext';

import SettingsBanners from '../components/settings/SettingsBanners';
import DisplaySettings from '../components/settings/DisplaySettings';
import OfflineStorageSettings from '../components/settings/OfflineStorageSettings';
import DataSyncSettings from '../components/settings/DataSyncSettings';
import NotificationSettings from '../components/settings/NotificationSettings';
import AccountSettings from '../components/settings/AccountSettings';

const SettingsScreen = () => {
    const navigation = useNavigation();
    const { theme, themeMode, toggleTheme } = useTheme();
    const colors = theme.colors;
    const { signIn } = useUser();

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

    const handleSyncWithCloud = async () => {
        setSettingsLoading(true);
        try {
            return await handleForceSyncWithCloud();
        } finally {
            setSettingsLoading(false);
        }
    };

    const handleResetSettings = async () => {
        setSettingsLoading(true);
        try {
            await resetPreferences();
        } finally {
            setSettingsLoading(false);
        }
    };

    const downloadAllHymns = async () => {
        if (isOffline) return false;

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
            throw error;
        } finally {
            setDownloadingHymns(false);
        }
    };

    const updateOfflineHymns = async () => {
        if (isOffline || !preferences.offlineDownload) return false;

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
            throw error;
        } finally {
            setDownloadingHymns(false);
        }
    };

    const clearOfflineHymns = async () => {
        try {
            setSettingsLoading(true);
            await clearAllHymns();
            await loadLocalHymnCount();
        } catch (error) {
            console.error('Error clearing offline hymns:', error);
            throw error;
        } finally {
            setSettingsLoading(false);
        }
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
    }, [colors]);

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
                <SettingsBanners
                    isLoggedIn={isLoggedIn}
                    syncing={syncing}
                    downloadingHymns={downloadingHymns}
                    downloadProgress={downloadProgress}
                    settingsLoading={settingsLoading}
                    isOffline={isOffline}
                    signIn={signIn}
                />

                <DisplaySettings
                    preferences={preferences}
                    updatePreference={updatePreference}
                    updateNestedPreference={updateNestedPreference}
                    settingsLoading={settingsLoading}
                    toggleTheme={toggleTheme}
                />

                <OfflineStorageSettings
                    preferences={preferences}
                    updatePreference={updatePreference}
                    settingsLoading={settingsLoading}
                    downloadingHymns={downloadingHymns}
                    isOffline={isOffline}
                    localHymnCount={localHymnCount}
                    onDownloadAllHymns={downloadAllHymns}
                    onUpdateOfflineHymns={updateOfflineHymns}
                    onClearOfflineHymns={clearOfflineHymns}
                />

                <DataSyncSettings
                    preferences={preferences}
                    updatePreference={updatePreference}
                    settingsLoading={settingsLoading}
                    syncing={syncing}
                    isLoggedIn={isLoggedIn}
                    isOffline={isOffline}
                    onSyncWithCloud={handleSyncWithCloud}
                />

                <NotificationSettings
                    preferences={preferences}
                    updateNestedPreference={updateNestedPreference}
                    settingsLoading={settingsLoading}
                />

                <AccountSettings
                    settingsLoading={settingsLoading}
                    onResetSettings={handleResetSettings}
                />
            </ScrollView>
        </View>
    );
};

export default SettingsScreen;
