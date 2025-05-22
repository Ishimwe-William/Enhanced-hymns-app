import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/ui/Header';

const SettingsScreen = () => {
    const navigation = useNavigation();

    const handleMenuPress = () => {
        navigation.dispatch(DrawerActions.openDrawer());
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const SettingItem = ({ icon, title, subtitle, onPress, rightElement }) => (
        <TouchableOpacity style={styles.settingItem} onPress={onPress}>
            <View style={styles.settingIcon}>
                <Ionicons name={icon} size={22} color="#007AFF" />
            </View>
            <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{title}</Text>
                {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
            </View>
            {rightElement || <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Header
                title="Settings"
                showMenu
                onBack={handleBack}
                onMenu={handleMenuPress}
            />
            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Display</Text>
                    <SettingItem
                        icon="text"
                        title="Font Size"
                        subtitle="Medium"
                        onPress={() => {}}
                    />
                    <SettingItem
                        icon="color-palette"
                        title="Theme"
                        subtitle="Light"
                        onPress={() => {}}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Audio</Text>
                    <SettingItem
                        icon="volume-high"
                        title="Playback Volume"
                        subtitle="80%"
                        onPress={() => {}}
                    />
                    <SettingItem
                        icon="musical-note"
                        title="Auto-play"
                        subtitle="Off"
                        onPress={() => {}}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Data</Text>
                    <SettingItem
                        icon="cloud-download"
                        title="Offline Download"
                        subtitle="Download hymns for offline use"
                        onPress={() => {}}
                    />
                    <SettingItem
                        icon="sync"
                        title="Sync Favorites"
                        subtitle="Backup your favorites"
                        onPress={() => {}}
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
