import {Alert} from "react-native";

export const handleManualDownload = async (isOffline, localHymnCount) => {
    if (isOffline) {
        Alert.alert('Offline', 'Please connect to the internet to download hymns.');
        return;
    }
    if (localHymnCount > 0 && preferences.offlineDownload) {
        Alert.alert(
            'Update Offline Hymns',
            `This will update your ${localHymnCount} offline hymns with the latest versions. Continue?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Update',
                    onPress: async () => {
                        const success = await updateOfflineHymns();
                        if (success) {
                            Alert.alert('Update Complete', 'Your offline hymns have been updated!');
                        }
                    },
                },
            ]
        );
    } else {
        Alert.alert(
            'Download All Hymns',
            'This will download all hymns for offline use. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Download',
                    onPress: async () => {
                        const success = await downloadAllHymns();
                        if (success) {
                            Alert.alert('Download Complete', 'All hymns are now available offline!');
                        }
                    },
                },
            ]
        );
    }
};
