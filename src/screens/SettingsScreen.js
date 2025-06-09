import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, Alert} from 'react-native';
import {useNavigation, DrawerActions} from '@react-navigation/native';
import Header from '../components/ui/Header';
import {usePreferences} from '../context/PreferencesContext';
import {useUser} from '../context/UserContext';
import WarningBanner from "../components/ui/WarningBanner";
import {ListItem} from "../components/ui/ListItem";
import {SwitchItem} from "../components/ui/SwitchItem";
import {useTheme} from "../context/ThemeContext";

const SettingsScreen = () => {
    const navigation = useNavigation();
    const { theme, themeMode, toggleTheme } = useTheme();
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
        dbInitialized
    } = usePreferences();

    const [settingsLoading, setSettingsLoading] = useState(false);

    useEffect(() => {
        if (preferences.theme && preferences.theme !== themeMode) {
            toggleTheme();
        }
    }, [preferences.theme]);

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

    const handleOfflineDownloadChange = async (value) => {
        try {
            await updatePreference('offlineDownload', value);
            if (value) {
                Alert.alert(
                    'Offline Download Enabled',
                    'Hymns will be downloaded for offline use. This may take some time.',
                    [{text: 'OK'}]
                );
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update offline download setting');
        }
    };

    const formatFontSize = (size) => {
        return size.charAt(0).toUpperCase() + size.slice(1);
    };

    const formatTheme = (theme) => {
        return theme.charAt(0).toUpperCase() + theme.slice(1);
    };

    const styles = StyleSheet.create({
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

                {settingsLoading && (
                    <WarningBanner
                        icon={"hourglass"}
                        message={"Updating settings..."}
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
                    <Text style={styles.sectionTitle}>Data & Sync</Text>
                    <SwitchItem
                        icon="cloud-download"
                        title="Offline Download"
                        subtitle="Download hymns for offline use"
                        value={preferences.offlineDownload}
                        onValueChange={handleOfflineDownloadChange}
                        disabled={settingsLoading}
                    />
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
