import React from 'react';
import WarningBanner from '../ui/WarningBanner';

const SettingsBanners = ({
                             isLoggedIn,
                             syncing,
                             downloadingHymns,
                             downloadProgress,
                             settingsLoading,
                             isOffline,
                             signIn
                         }) => {
    return (
        <>
            {!isLoggedIn && (
                <WarningBanner
                    message="Sign in to save your settings across devices"
                    signIn={signIn}
                />
            )}

            {syncing && (
                <WarningBanner
                    icon="sync"
                    message="Syncing settings with cloud..."
                />
            )}

            {downloadingHymns && (
                <WarningBanner
                    icon="cloud-download"
                    message={downloadProgress || "Downloading hymns for offline use..."}
                />
            )}

            {settingsLoading && (
                <WarningBanner
                    icon="update"
                    message="Updating settings..."
                />
            )}

            {isOffline && (
                <WarningBanner
                    icon="wifi-off"
                    message="You are currently offline"
                />
            )}
        </>
    );
};

export default SettingsBanners;
