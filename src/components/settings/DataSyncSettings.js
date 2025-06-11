import React from 'react';
import { ListItem } from '../ui/ListItem';
import { SwitchItem } from '../ui/SwitchItem';
import SettingsSection from './SettingsSection';
import Alert from './MyAlert';

const DataSyncSettings = ({
                              preferences,
                              updatePreference,
                              settingsLoading,
                              syncing,
                              isLoggedIn,
                              isOffline,
                              onSyncWithCloud
                          }) => {
    const handleSyncWithCloud = async () => {
        if (!isLoggedIn) {
            Alert.error('Please sign in to sync with cloud');
            return;
        }

        if (isOffline) {
            Alert.error('Please connect to the internet to sync with cloud');
            return;
        }

        try {
            const success = await onSyncWithCloud();
            if (success) {
                Alert.success('Settings synced from cloud successfully');
            } else {
                Alert.info('No cloud settings found or settings are up to date');
            }
        } catch (error) {
            Alert.error('Failed to sync with cloud: ' + error.message);
        }
    };

    if (!isLoggedIn) {
        return null;
    }

    return (
        <SettingsSection title="Data & Sync">
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
        </SettingsSection>
    );
};

export default DataSyncSettings;
