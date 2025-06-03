import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Alert} from 'react-native';
import {useNavigation, DrawerActions} from '@react-navigation/native';
import {Ionicons} from '@expo/vector-icons';
import Header from '../components/ui/Header';
import {usePreferences} from '../context/PreferencesContext';
import {useUser} from '../context/UserContext';
import WarningBanner from "../components/ui/WarningBanner";

const SettingsScreen = () => {
    const navigation = useNavigation();
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
        const newTheme = preferences.theme === 'light' ? 'dark' : 'light';
        updatePreference('theme', newTheme);
    };

    const handleVolumeChange = () => {
        // This would typically open a slider or picker
        Alert.alert(
            'Volume Settings',
            'Volume adjustment would open here',
            [{text: 'OK'}]
        );
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

    const SettingItem = ({icon, title, subtitle, onPress, rightElement}) => (
        <TouchableOpacity style={styles.settingItem} onPress={onPress}>
            <View style={styles.settingIcon}>
                <Ionicons name={icon} size={22} color="#007AFF"/>
            </View>
            <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{title}</Text>
                {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
            </View>
            {rightElement || <Ionicons name="chevron-forward" size={20} color="#C7C7CC"/>}
        </TouchableOpacity>
    );

    const SwitchItem = ({icon, title, subtitle, value, onValueChange}) => (
        <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
                <Ionicons name={icon} size={22} color="#007AFF"/>
            </View>
            <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{title}</Text>
                {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{false: '#E5E5EA', true: '#34C759'}}
                thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
            />
        </View>
    );

    const formatFontSize = (size) => {
        return size.charAt(0).toUpperCase() + size.slice(1);
    };

    const formatTheme = (theme) => {
        return theme.charAt(0).toUpperCase() + theme.slice(1);
    };

    return (
        <View style={styles.container}>
            <Header
                title="Settings"
                showMenu
                onBack={handleBack}
                onMenu={handleMenuPress}
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
                        color={"#007AFF"}
                        message={"Syncing settings with cloud..."}
                    />
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Display</Text>
                    <SettingItem
                        icon="text"
                        title="Font Size"
                        subtitle={formatFontSize(preferences.fontSize)}
                        onPress={handleFontSizeChange}
                    />
                    <SettingItem
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
                    <Text style={styles.sectionTitle}>Audio</Text>
                    <SettingItem
                        icon="volume-high"
                        title="Playback Volume"
                        subtitle={`${preferences.playbackVolume}%`}
                        onPress={handleVolumeChange}
                    />
                    <SwitchItem
                        icon="play"
                        title="Auto-play"
                        subtitle="Automatically play hymns"
                        value={preferences.autoPlay}
                        onValueChange={(value) => updatePreference('autoPlay', value)}
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
                            <SettingItem
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
                    <SettingItem
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
    },
    section: {
        marginTop: 32,
        marginHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
        marginLeft: 16,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
        marginBottom: 1,
    },
    settingIcon: {
        width: 32,
        height: 32,
        borderRadius: 6,
        backgroundColor: '#F0F8FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    settingContent: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    settingSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
});

export default SettingsScreen;
