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
        syncing
    } = usePreferences();
    const [loading, setLoading] = useState(false);

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

    const handleFontSizeChange = () => {
        const sizes = ['small', 'medium', 'large'];
        const currentIndex = sizes.indexOf(preferences.fontSize);
        const nextIndex = (currentIndex + 1) % sizes.length;
        updatePreference('fontSize', sizes[nextIndex]);
    };

    const handleThemeChange = () => {
        toggleTheme();
        const newTheme = preferences.theme === 'light' ? 'dark' : 'light';
        updatePreference('theme', newTheme);
    };

    const handleResetSettings = () => {
        Alert.alert(
            'Reset Settings',
            'Are you sure you want to reset all settings to defaults?',
            [
                {text: 'Cancel', style: 'cancel'},
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await resetPreferences();
                            Alert.alert('Success', 'Settings have been reset to defaults');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to reset settings');
                        } finally {
                            setLoading(false);
                        }
                    }
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
        }
    });

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

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Display</Text>
                    <ListItem
                        icon="text"
                        title="Font Size"
                        subtitle={formatFontSize(preferences.fontSize)}
                        onPress={handleFontSizeChange}
                    />
                    <ListItem
                        icon="color-palette"
                        title="Theme"
                        subtitle={formatTheme(preferences.theme)}
                        onPress={handleThemeChange}
                    />
                    <SwitchItem
                        icon="musical-notes"
                        title="Show Chords"
                        subtitle="Display chord notations"
                        value={preferences.display.showChords}
                        onValueChange={(value) => updateNestedPreference('display', 'showChords', value)}
                    />
                    <SwitchItem
                        icon="list"
                        title="Show Verse Numbers"
                        subtitle="Display verse numbering"
                        value={preferences.display.showVerseNumbers}
                        onValueChange={(value) => updateNestedPreference('display', 'showVerseNumbers', value)}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Data & Sync</Text>
                    <SwitchItem
                        icon="cloud-download"
                        title="Offline Download"
                        subtitle="Download hymns for offline use"
                        value={preferences.offlineDownload}
                        onValueChange={(value) => updatePreference('offlineDownload', value)}
                    />
                    {isLoggedIn && (
                        <>
                            <SwitchItem
                                icon="sync"
                                title="Sync Favorites"
                                subtitle="Backup your favorites to cloud"
                                value={preferences.syncFavorites}
                                onValueChange={(value) => updatePreference('syncFavorites', value)}
                            />
                            <ListItem
                                icon="cloud-download"
                                title="Sync from Cloud"
                                subtitle="Download latest settings from cloud"
                                onPress={handleForceSyncWithCloud}
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
                    />
                    <SwitchItem
                        icon="alarm"
                        title="Daily Reminder"
                        subtitle="Daily hymn reminder"
                        value={preferences.notifications.dailyReminder}
                        onValueChange={(value) => updateNestedPreference('notifications', 'dailyReminder', value)}
                    />
                    <SwitchItem
                        icon="add-circle"
                        title="New Hymns"
                        subtitle="Notify about new hymns"
                        value={preferences.notifications.newHymns}
                        onValueChange={(value) => updateNestedPreference('notifications', 'newHymns', value)}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <ListItem
                        icon="refresh"
                        title="Reset Settings"
                        subtitle="Reset all settings to defaults"
                        onPress={handleResetSettings}
                    />
                </View>
            </ScrollView>
        </View>
    );
};


export default SettingsScreen;
