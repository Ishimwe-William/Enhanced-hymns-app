import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Pressable} from 'react-native';
import {useNavigation, DrawerActions, useIsFocused} from '@react-navigation/native';
import Header from '../../components/ui/Header';
import SearchBar from '../../components/ui/SearchBar';
import HymnListView from '../../components/hymns/list/HymnListView';
import LoadingScreen from '../../components/LoadingScreen';
import {useHymns} from '../../context/HymnContext';
import EmptyHymnList from "../../components/hymns/EmptyHymnList";
import {Ionicons} from "@expo/vector-icons";
import {useTheme} from "../../context/ThemeContext";
import MyAlert from "../../components/ui/MyAlert";
import {useFilteredHymns} from "../../hooks/useFilteredHymns";

const HymnsList = () => {
    const navigation = useNavigation();
    const {hymns, loading, getLocalHymnCount, forceSync, isOffline, checkAndUpdateLyrics} = useHymns();
    const [searchQuery, setSearchQuery] = useState('');
    const {colors} = useTheme().theme;
    const [localHymnCount, setLocalHymnCount] = useState(0);
    const isFocused = useIsFocused();
    const [viewMode, setViewMode] = useState('list');

    useEffect(() => { loadLocalHymnCount(); }, [isFocused, getLocalHymnCount]);

    const loadLocalHymnCount = async () => {
        try {
            const count = await getLocalHymnCount();
            setLocalHymnCount(count);
        } catch (error) {
            console.error('Error loading local hymn count:', error);
            setLocalHymnCount(0);
        }
    };

    const filteredHymns = useFilteredHymns(hymns, searchQuery);

    const handleMenuPress = () => navigation.dispatch(DrawerActions.openDrawer());

    const handleHymnSelect = (hymnId) => {
        try {
            navigation.navigate('HymnDetail', {hymnId});
        } catch (error) {
            console.error('Error navigating to hymn detail:', error);
        }
    };

    const downloadAllHymns = () => {
        if (isOffline) {
            MyAlert.show("Offline", "Please connect to the internet to download lyrics.");
            return;
        }
        MyAlert.show(
            "Download Lyrics",
            "Do you want to download all hymn lyrics for offline access? (Audio tunes are not included)",
            [
                {text: 'Cancel', style: "cancel"},
                {
                    text: 'Download',
                    onPress: async () => {
                        try {
                            const success = await forceSync(null, false);
                            if (success) {
                                await loadLocalHymnCount();
                                MyAlert.show("Success", "Lyrics downloaded successfully.");
                            }
                        } catch (error) {
                            console.error('Error downloading lyrics:', error);
                            MyAlert.show("Error", "Failed to download lyrics.");
                        }
                    }
                }
            ],
        );
    };

    const refreshHymns = async () => {
        if (isOffline) {
            MyAlert.show("Offline", "Please connect to the internet to check for lyric updates.");
            return;
        }
        try {
            const result = await checkAndUpdateLyrics();
            MyAlert.show(
                result.success ? (result.count > 0 ? "Updates Found" : "Up to Date") : "Error",
                result.message
            );
            if (result.success && result.count > 0) await loadLocalHymnCount();
        } catch (error) {
            console.error('Error updating lyrics:', error);
            MyAlert.show("Error", "An unexpected error occurred while checking for updates.");
        }
    };

    const styles = StyleSheet.create({
        container: { flex: 1 },
        toolbar: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingRight: 8,
            backgroundColor: colors.card,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        searchBar: { flex: 1 },
        iconButton: {
            width: 36,
            height: 36,
            borderRadius: 10,
            marginLeft: 4,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.primary,
        },
    });

    return (
        <View style={styles.container}>
            <Header
                title="Hymns"
                showMenu
                showRefresh
                onMenu={handleMenuPress}
                onRefresh={refreshHymns}
                showMore={false}
            />
            {loading ? (
                <LoadingScreen message="Loading hymns..." />
            ) : (
                <>
                    <View style={styles.toolbar}>
                        <View style={styles.searchBar}>
                            <SearchBar
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholder="Search hymns..."
                            />
                        </View>
                        <Pressable
                            style={styles.iconButton}
                            android_ripple={{color: colors.textSecondary, borderless: true}}
                            onPress={() => setViewMode(prev => prev === 'list' ? 'grid' : 'list')}
                        >
                            <Ionicons
                                name={viewMode === 'list' ? "grid-outline" : "list-outline"}
                                size={20}
                                color={colors.header}
                            />
                        </Pressable>
                        {localHymnCount === 0 && (
                            <Pressable
                                style={styles.iconButton}
                                android_ripple={{color: colors.textSecondary, borderless: true}}
                                onPress={downloadAllHymns}
                            >
                                <Ionicons name="cloud-download-outline" size={20} color={colors.header} />
                            </Pressable>
                        )}
                    </View>

                    {filteredHymns.length === 0 ? (
                        <EmptyHymnList />
                    ) : (
                        <HymnListView
                            hymns={filteredHymns}
                            onHymnSelect={handleHymnSelect}
                            viewMode={viewMode}
                        />
                    )}
                </>
            )}
        </View>
    );
};

export default HymnsList;