import React from 'react';
import { ListItem } from '../ui/ListItem';
import { SwitchItem } from '../ui/SwitchItem';
import SettingsSection from './SettingsSection';
import Alert from './MyAlert';

const DisplaySettings = ({ preferences, updatePreference, updateNestedPreference, settingsLoading, toggleTheme }) => {
    const formatText = (text) => {
        return text.charAt(0).toUpperCase() + text.slice(1);
    };

    const handleFontSizeChange = async () => {
        try {
            const sizes = ['small', 'medium', 'large'];
            const currentIndex = sizes.indexOf(preferences.fontSize);
            const nextIndex = (currentIndex + 1) % sizes.length;
            await updatePreference('fontSize', sizes[nextIndex]);
        } catch (error) {
            Alert.error('Failed to update font size');
        }
    };

    const handleThemeChange = async () => {
        try {
            toggleTheme();
            const newTheme = preferences.theme === 'light' ? 'dark' : 'light';
            await updatePreference('theme', newTheme);
        } catch (error) {
            Alert.error('Failed to update theme');
        }
    };

    return (
        <SettingsSection title="Display">
            <ListItem
                icon="text"
                title="Font Size"
                subtitle={formatText(preferences.fontSize)}
                onPress={handleFontSizeChange}
                disabled={settingsLoading}
            />
            <ListItem
                icon="color-palette"
                title="Theme"
                subtitle={formatText(preferences.theme)}
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
        </SettingsSection>
    );
};

export default DisplaySettings;
