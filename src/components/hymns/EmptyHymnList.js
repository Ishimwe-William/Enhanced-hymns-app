import React, {useState} from 'react';
import {View, ScrollView, Text, StyleSheet, ActivityIndicator} from 'react-native';
import {useTheme} from '../../context/ThemeContext';
import {useHymns} from '../../context/HymnContext';
import {usePreferences} from '../../context/PreferencesContext';
import Alert from '../ui/MyAlert';
import WarningBanner from "../ui/WarningBanner";
import {IconTextButton} from "../ui/IconTextButton";

const EmptyHymnList = ({onHymnsDownloaded}) => {
    const {theme} = useTheme();
    const colors = theme.colors;
    const {forceSync, setSyncing, isOffline} = useHymns();
    const {updatePreference} = usePreferences();

    const [downloading, setDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(null);

    const downloadAllHymns = async () => {
        if (isOffline) {
            Alert.error('Please connect to the internet to download hymns.');
            return;
        }

        Alert.confirm(
            'Download All Hymns',
            'This will download all hymns for offline use. This may take some time and use data. Continue?',
            async () => {
                try {
                    setDownloading(true);
                    setDownloadProgress('Starting download...');

                    const success = await forceSync(
                        (hymns) => {
                            // Update hymns in context
                            if (onHymnsDownloaded) {
                                onHymnsDownloaded(hymns);
                            }
                        },
                        setSyncing,
                        isOffline,
                        setDownloadProgress
                    );

                    if (success) {
                        await updatePreference('offlineDownload', true);
                        Alert.success('All hymns downloaded successfully! You can now browse hymns offline.');
                        setTimeout(() => setDownloadProgress(null), 2000);
                    } else {
                        throw new Error('Failed to download hymns');
                    }
                } catch (error) {
                    console.error('Error downloading hymns:', error);
                    setDownloadProgress(null);
                    Alert.error('Download failed: ' + (error.message || 'Unknown error'));
                } finally {
                    setDownloading(false);
                }
            }
        );
    };

    const styles = StyleSheet.create({
        scrollView: {
            flexGrow: 1,
        },
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 32,
            backgroundColor: colors.card,
        },
        iconContainer: {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: colors.primary + '20',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 24,
        },
        iconText: {
            fontSize: 32,
            color: colors.primary,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text,
            textAlign: 'center',
            marginBottom: 12,
        },
        subtitle: {
            fontSize: 16,
            color: colors.textSecondary,
            textAlign: 'center',
            lineHeight: 24,
            marginBottom: 32,
        },
        downloadButton: {
            backgroundColor: colors.primary,
            paddingHorizontal: 32,
            paddingVertical: 16,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: colors.primary,
            shadowOffset: {width: 0, height: 4},
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
        },
        downloadButtonDisabled: {
            backgroundColor: colors.textSecondary + '40',
        },
        downloadButtonText: {
            color: 'white',
            fontSize: 16,
            fontWeight: '600',
            marginLeft: 8,
        },
        progressContainer: {
            marginTop: 24,
            alignItems: 'center',
        },
        progressText: {
            fontSize: 14,
            color: colors.textSecondary,
            marginTop: 12,
            textAlign: 'center',
        },
        offlineNoticeText: {
            fontSize: 14,
            color: colors.text,
            textAlign: 'center',
        },
    });

    return (
        <ScrollView contentContainerStyle={styles.scrollView}>
            <View style={styles.container}>
                <View style={styles.iconContainer}>
                    <Text style={styles.iconText}>📖</Text>
                </View>

                <Text style={styles.title}>No Hymns Available</Text>

                <Text style={styles.subtitle}>
                    {isOffline
                        ? "You're currently offline. Connect to the internet to download hymns for offline use."
                        : "Download all hymns to browse and search through the complete collection, even when offline."
                    }
                </Text>

                {!isOffline && (
                    <IconTextButton
                        icon={"cloud-download"}
                        text={downloading ? 'Downloading...' : 'Download All Hymns'}
                        onPress={downloadAllHymns}
                    />
                )}

                {downloading && downloadProgress && (
                    <View style={styles.progressContainer}>
                        <ActivityIndicator size="large" color={colors.primary}/>
                        <Text style={styles.progressText}>{downloadProgress}</Text>
                    </View>
                )}

                {isOffline && (
                    <WarningBanner
                        icon={"wifi-off"}
                        message={"Connect to internet to download hymns"}
                    />
                )}
            </View>
        </ScrollView>
    );
};

export default EmptyHymnList;
