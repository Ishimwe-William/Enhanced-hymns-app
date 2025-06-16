import {
    loadFavoritesFromCloud,
    loadRecentFromCloud,
    saveFavoritesToCloud,
    saveRecentToCloud,
} from '../../services/preferencesService';
import {
    saveFavorites,
    loadFavorites,
    saveRecentHymns,
    loadRecentHymns,
    deleteFromSecureStore,
    getFavoritesKey,
    getRecentKey,
} from './secureStoreUtils';

export const loadUserData = async (userId, syncFavorites, isOffline, setFavorites, setRecentHymns) => {
    try {
        if (userId) {
            let localFavorites = await loadFavorites(userId) || [];
            setFavorites(localFavorites);
            let localRecent = await loadRecentHymns(userId) || [];
            setRecentHymns(localRecent);
            if (syncFavorites && !isOffline) {
                try {
                    // Load cloud data
                    const cloudFavorites = await loadFavoritesFromCloud(userId) || [];
                    const cloudRecent = await loadRecentFromCloud(userId) || [];

                    // Merge favorites: prioritize cloud if different and non-empty, else sync local to cloud
                    if (cloudFavorites.length > 0 && JSON.stringify(cloudFavorites) !== JSON.stringify(localFavorites)) {
                        setFavorites(cloudFavorites);
                        await saveFavorites(userId, cloudFavorites);
                    } else if (localFavorites.length > 0 && cloudFavorites.length === 0) {
                        await saveFavoritesToCloud(userId, localFavorites);
                    }

                    // Merge recent hymns: combine, deduplicate by id, sort by timestamp, limit to 20
                    const allRecent = [...localRecent, ...cloudRecent];
                    const uniqueRecent = allRecent
                        .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)) // Sort by timestamp descending
                        .filter((hymn, index, self) => index === self.findIndex((t) => t.id === hymn.id)) // Remove duplicates by id
                        .slice(0, 20); // Limit to 20 entries
                    if (JSON.stringify(uniqueRecent) !== JSON.stringify(localRecent)) {
                        setRecentHymns(uniqueRecent);
                        await saveRecentHymns(userId, uniqueRecent);
                    }
                    if (uniqueRecent.length > 0 && JSON.stringify(uniqueRecent) !== JSON.stringify(cloudRecent)) {
                        await saveRecentToCloud(userId, uniqueRecent);
                    }
                } catch (syncError) {
                    console.log('Cloud sync failed, using local data:', syncError.message);
                }
            }
        } else {
            setFavorites([]);
            setRecentHymns([]);
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
};

export const saveFavoritesHandler = async (userId, favoritesData, syncFavorites, isOffline) => {
    try {
        if (userId) {
            await saveFavorites(userId, favoritesData);
            if (syncFavorites && !isOffline) {
                try {
                    await saveFavoritesToCloud(userId, favoritesData);
                } catch (cloudError) {
                    console.log('Cloud sync failed for favorites, saved locally');
                }
            }
        }
    } catch (error) {
        console.error('Error saving favorites:', error);
    }
};

export const saveRecentHymnsHandler = async (userId, recentData, syncFavorites, isOffline) => {
    try {
        if (userId) {
            await saveRecentHymns(userId, recentData);
            if (syncFavorites && !isOffline) {
                try {
                    await saveRecentToCloud(userId, recentData);
                } catch (cloudError) {
                    console.log('Cloud sync failed for recent hymns, saved locally');
                }
            }
        }
    } catch (error) {
        console.error('Error saving recent hymns:', error);
    }
};

export const toggleFavorite = async (hymn, favorites, setFavorites, userId, syncFavorites, isOffline) => {
    const newFavorites = favorites.find((fav) => fav.id === hymn.id)
        ? favorites.filter((fav) => fav.id !== hymn.id)
        : [...favorites, hymn];
    setFavorites(newFavorites);
    await saveFavoritesHandler(userId, newFavorites, syncFavorites, isOffline);
};

export const addToRecent = async (hymn, recentHymns, setRecentHymns, userId, syncFavorites, isOffline) => {
    const filteredRecent = recentHymns.filter((recent) => recent.id !== hymn.id);
    const newRecent = [{ ...hymn, timestamp: new Date().toISOString() }, ...filteredRecent].slice(0, 20);
    setRecentHymns(newRecent);
    await saveRecentHymnsHandler(userId, newRecent, syncFavorites, isOffline);
};

export const clearRecentHymns = async (userId, setRecentHymns) => {
    try {
        await saveRecentHymns(userId, []); // Save to storage first
        setRecentHymns([]); // Update state only on success
    } catch (error) {
        console.error('Error clearing recent hymns:', error);
        throw error; // Propagate error to caller
    }
};

export const clearFavorites = async (userId, setFavorites) => {
    try {
        setFavorites([]);
        await saveFavorites(userId, []);
    } catch (error) {
        console.error('Error clearing favorites:', error);
        throw error;
    }
};

export const clearUserData = async (userId, setFavorites, setRecentHymns) => {
    try {
        if (userId) {
            await deleteFromSecureStore(getFavoritesKey(userId));
            await deleteFromSecureStore(getRecentKey(userId));
        }
        setFavorites([]);
        setRecentHymns([]);
    } catch (error) {
        console.error('Error clearing user data:', error);
    }
};

export const isFavorite = (hymnId, favorites) => favorites.some((fav) => fav.id === hymnId);
