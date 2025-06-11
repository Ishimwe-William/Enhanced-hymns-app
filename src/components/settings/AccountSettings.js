import React from 'react';
import { ListItem } from '../ui/ListItem';
import SettingsSection from './SettingsSection';
import Alert from './MyAlert';

const AccountSettings = ({ settingsLoading, onResetSettings }) => {
    const handleResetSettings = () => {
        Alert.destructiveConfirm(
            'Reset Settings',
            'Are you sure you want to reset all settings to defaults? This will also clear local database preferences.',
            async () => {
                try {
                    await onResetSettings();
                    Alert.success('Settings have been reset to defaults');
                } catch (error) {
                    Alert.error('Failed to reset settings: ' + error.message);
                }
            },
            null,
            'Reset'
        );
    };

    return (
        <SettingsSection title="Account">
            <ListItem
                icon="refresh"
                title="Reset Settings"
                subtitle="Reset all settings to defaults"
                onPress={handleResetSettings}
                disabled={settingsLoading}
            />
        </SettingsSection>
    );
};

export default AccountSettings;
