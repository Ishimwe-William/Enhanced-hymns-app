import React from 'react';
import { SwitchItem } from '../ui/SwitchItem';
import SettingsSection from './SettingsSection';

const NotificationSettings = ({ preferences, updateNestedPreference, settingsLoading }) => {
    return (
        <SettingsSection title="Notifications">
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
        </SettingsSection>
    );
};

export default NotificationSettings;
