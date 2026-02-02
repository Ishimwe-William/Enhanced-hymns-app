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
    const {hymns, loading, syncHymns, setSyncing, getLocalHymnCount} = useHymns();
    const [searchQuery, setSearchQuery] = useState('');
    const {colors} = useTheme().theme;
    const [localHymnCount, setLocalHymnCount] = useState(0);
    const isFocused = useIsFocused();

    // NEW: State for view mode
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

    useEffect(() => {
        loadLocalHymnCount();
    }, [isFocused, getLocalHymnCount,]);

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

    const handleMenuPress = () => {
        navigation.dispatch(DrawerActions.openDrawer());
    };

    const handleHymnSelect = (hymnId) => {
        try {
            navigation.navigate('HymnDetail', {hymnId});
        } catch (error) {
            console.error('Error navigating to hymn detail:', error);
        }
    };

    const downloadAllHymns = () => {
        MyAlert.show("Downloading hymns", "This will take you to settings where you can download all hymns for offline access",
            [{text: 'Cancel', style: "cancel"}, {
                text: 'Go to Settings',
                onPress: () => navigation.navigate("Settings")
            }],
        );
    };

    // NEW: Toggle handler
    const toggleViewMode = () => {
        setViewMode(prev => prev === 'list' ? 'grid' : 'list');
    };

    const refreshHymns = async () => {
        try {
            const success = await syncHymns(true, setSyncing, hymns => setHymns(hymns));

            if (success !== false) {
                await loadLocalHymnCount();
                return true;
            } else {
                throw new Error('Failed to update hymns');
            }
        } catch (error) {
            console.error('Error syncing hymns:', error);
        }
    }

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
                <LoadingScreen message="Loading hymns..."/>
            ) : (
                <>
                    <View style={styles.searchContainer}>
                        <View style={styles.searchBar}>
                            <SearchBar
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholder="Search hymns..."
                            />
                        </View>

                        {/* NEW: View Mode Toggle Button */}
                        <Pressable
                            style={styles.iconButton}
                            android_ripple={{color: colors.textSecondary, borderless: true}}
                            onPress={toggleViewMode}
                        >
                            <Ionicons
                                name={viewMode === 'list' ? "grid-outline" : "list-outline"}
                                size={24}
                                color={colors.header}
                            />
                        </Pressable>

                        {localHymnCount === 0 && (
                            <Pressable
                                style={styles.iconButton}
                                android_ripple={{color: colors.textSecondary, borderless: true}}
                                onPress={downloadAllHymns}
                            >
                                <Ionicons
                                    name={"cloud-download-outline"}
                                    size={24}
                                    color={colors.header}
                                />
                            </Pressable>
                        )}
                    </View>

                    {filteredHymns.length === 0 ? (
                        <EmptyHymnList/>
                    ) : (
                        <HymnListView
                            hymns={filteredHymns}
                            onHymnSelect={handleHymnSelect}
                            viewMode={viewMode} // Pass the state down
                        />
                    )}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchContainer: {
        flexDirection: 'row',
        //alignItems: 'center',
        marginRight: 10, // Added padding for the icons on the right
    },
    searchBar: {
        flex: 1,
    },
    // Updated generic style for both buttons
    iconButton: {
        paddingHorizontal: 8,
        marginLeft: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default HymnsList;