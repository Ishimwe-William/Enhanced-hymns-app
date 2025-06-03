import React, {createContext, useContext, useState, useEffect} from 'react';
import {fetchHymns, fetchHymnDetails, updateHymnData} from '../services/hymnService';
import {
    saveFavoritesToCloud,
    loadFavoritesFromCloud,
    saveRecentToCloud,
    loadRecentFromCloud
} from '../services/preferencesService';
import {useUser} from './UserContext';
import {usePreferences} from './PreferencesContext';
import * as SecureStore from 'expo-secure-store';

const HymnContext = createContext();

export const useHymns = () => {
    const context = useContext(HymnContext);
    if (!context) {
        throw new Error('useHymns must be used within a HymnProvider');
    }
    return context;
};

export const HymnProvider = ({children}) => {
    const [hymns, setHymns] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [recentHymns, setRecentHymns] = useState([]);
    const [loading, setLoading] = useState(true);

    const {user} = useUser();
    const {preferences} = usePreferences();

    // Generate storage keys based on user ID
    const getFavoritesKey = (userId) => `userFavorites_${userId}`;
    const getRecentKey = (userId) => `userRecent_${userId}`;

    // Load user-specific data when user changes
    useEffect(() => {
        const loadUserData = async () => {
            try {
                if (user?.uid) {
                    // Load favorites
                    const favoritesKey = getFavoritesKey(user.uid);
                    const storedFavorites = await SecureStore.getItemAsync(favoritesKey);
                    let localFavorites = [];

                    if (storedFavorites) {
                        localFavorites = JSON.parse(storedFavorites);
                    }

                    setFavorites(localFavorites);

                    // Load recent hymns
                    const recentKey = getRecentKey(user.uid);
                    const storedRecent = await SecureStore.getItemAsync(recentKey);
                    let localRecent = [];

                    if (storedRecent) {
                        localRecent = JSON.parse(storedRecent);
                    }

                    setRecentHymns(localRecent);

                    // Sync with cloud if enabled
                    if (preferences.syncFavorites) {
                        try {
                            // Sync favorites
                            const cloudFavorites = await loadFavoritesFromCloud(user.uid);
                            if (cloudFavorites.length > 0 && JSON.stringify(cloudFavorites) !== JSON.stringify(localFavorites)) {
                                setFavorites(cloudFavorites);
                                await SecureStore.setItemAsync(favoritesKey, JSON.stringify(cloudFavorites));
                            } else if (localFavorites.length > 0 && cloudFavorites.length === 0) {
                                // Save local favorites to cloud
                                await saveFavoritesToCloud(user.uid, localFavorites);
                            }

                            // Sync recent hymns (less critical, no alerts on failure)
                            try {
                                const cloudRecent = await loadRecentFromCloud(user.uid);
                                if (cloudRecent.length > 0 && JSON.stringify(cloudRecent) !== JSON.stringify(localRecent)) {
                                    setRecentHymns(cloudRecent);
                                    await SecureStore.setItemAsync(recentKey, JSON.stringify(cloudRecent));
                                } else if (localRecent.length > 0 && cloudRecent.length === 0) {
                                    await saveRecentToCloud(user.uid, localRecent);
                                }
                            } catch (recentSyncError) {
                                console.log('Recent hymns sync failed, using local data');
                            }
                        } catch (syncError) {
                            console.log('Favorites sync failed, using local data');
                        }
                    }
                } else {
                    // No user - clear personal data
                    setFavorites([]);
                    setRecentHymns([]);
                }
            } catch (error) {
                console.error('Error loading user data:', error);
            }
        };

        loadUserData();
    }, [user?.uid, preferences.syncFavorites]);

    // Save favorites to storage and optionally to cloud
    const saveFavorites = async (favoritesData) => {
        try {
            if (user?.uid) {
                const favoritesKey = getFavoritesKey(user.uid);
                await SecureStore.setItemAsync(favoritesKey, JSON.stringify(favoritesData));

                // Save to cloud if sync is enabled
                if (preferences.syncFavorites) {
                    try {
                        await saveFavoritesToCloud(user.uid, favoritesData);
                    } catch (cloudError) {
                        console.log('Cloud sync failed for favorites, saved locally');
                    }
                }
            }
        } catch (error) {
            console.error('Error saving favorites:', error);
        }
    };

    // Save recent hymns to storage and optionally to cloud
    const saveRecentHymns = async (recentData) => {
        try {
            if (user?.uid) {
                const recentKey = getRecentKey(user.uid);
                await SecureStore.setItemAsync(recentKey, JSON.stringify(recentData));

                // Save to cloud if sync is enabled (less critical, no error alerts)
                if (preferences.syncFavorites) {
                    try {
                        await saveRecentToCloud(user.uid, recentData);
                    } catch (cloudError) {
                        console.log('Cloud sync failed for recent hymns, saved locally');
                    }
                }
            }
        } catch (error) {
            console.error('Error saving recent hymns:', error);
        }
    };

    const loadHymns = async () => {
        try {
            setLoading(true);
            const hymnsData = await fetchHymns();
            setHymns(hymnsData);
        } catch (error) {
            console.error('Error loading hymns:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadHymnDetails = async (hymnId) => {
        try {
            const hymnData = await fetchHymnDetails(hymnId);
            addToRecent(hymnData);
            return hymnData;
        } catch (error) {
            console.error('Error loading hymn details:', error);
            throw error;
        }
    };

    const toggleFavorite = async (hymn) => {
        const newFavorites = favorites.find(fav => fav.id === hymn.id)
            ? favorites.filter(fav => fav.id !== hymn.id)
            : [...favorites, hymn];

        setFavorites(newFavorites);
        await saveFavorites(newFavorites);
    };

    const updateHymn = async (hymnId, hymnData) => {
        try {
            await updateHymnData(hymnId, hymnData);

            // Update local hymns list to reflect changes
            setHymns(prevHymns =>
                prevHymns.map(hymn =>
                    hymn.id === hymnId
                        ? {...hymn, ...hymnData}
                        : hymn
                )
            );

            return true;
        } catch (error) {
            console.error('Error updating hymn:', error);
            throw error;
        }
    };

    const addToRecent = async (hymn) => {
        const newRecent = [hymn, ...recentHymns.filter(recent => recent.id !== hymn.id)].slice(0, 20);
        setRecentHymns(newRecent);
        await saveRecentHymns(newRecent);
    };

    // Clear recent hymns
    const clearRecentHymns = async () => {
        try {
            setRecentHymns([]);
            await saveRecentHymns([]);
        } catch (error) {
            console.error('Error clearing recent hymns:', error);
            throw error;
        }
    };

    // Clear all favorites
    const clearFavorites = async () => {
        try {
            setFavorites([]);
            await saveFavorites([]);
        } catch (error) {
            console.error('Error clearing favorites:', error);
            throw error;
        }
    };

    const isFavorite = (hymnId) => {
        return favorites.some(fav => fav.id === hymnId);
    };

    // Get hymns filtered by user preferences
    const getFilteredHymns = () => {
        let filteredHymns = [...hymns];

        // Apply any preference-based filtering here
        // For example, if user prefers certain categories
        if (preferences.display && preferences.display.hiddenCategories) {
            filteredHymns = filteredHymns.filter(hymn =>
                !preferences.display.hiddenCategories.includes(hymn.category)
            );
        }

        return filteredHymns;
    };

    // Get hymn display settings based on user preferences
    const getHymnDisplaySettings = () => {
        return {
            fontSize: preferences.fontSize || 'medium',
            showChords: preferences.display?.showChords !== false,
            showVerseNumbers: preferences.display?.showVerseNumbers !== false,
            lineSpacing: preferences.display?.lineSpacing || 'normal',
            theme: preferences.theme || 'light',
        };
    };

    // Clear all user data (for logout)
    const clearUserData = async () => {
        try {
            if (user?.uid) {
                const favoritesKey = getFavoritesKey(user.uid);
                const recentKey = getRecentKey(user.uid);

                await SecureStore.deleteItemAsync(favoritesKey);
                await SecureStore.deleteItemAsync(recentKey);
            }

            setFavorites([]);
            setRecentHymns([]);
        } catch (error) {
            console.error('Error clearing user data:', error);
        }
    };

    useEffect(() => {
        loadHymns();
    }, []);

    // Clear user data when user logs out
    useEffect(() => {
        if (!user?.uid) {
            clearUserData();
        }
    }, [user?.uid]);

    const value = {
        hymns: getFilteredHymns(),
        favorites,
        recentHymns,
        loading,
        loadHymns,
        loadHymnDetails,
        toggleFavorite,
        isFavorite,
        updateHymn,
        getHymnDisplaySettings,
        clearUserData,
        clearRecentHymns,
        clearFavorites,
        isLoggedIn: !!user?.uid,
    };

    return (
        <HymnContext.Provider value={value}>
            {children}
        </HymnContext.Provider>
    );
};
