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
            let localFavorites = await loadFavorites(userId);
            setFavorites(localFavorites);
            let localRecent = await loadRecentHymns(userId);
            setRecentHymns(localRecent);
            if (syncFavorites && !isOffline) {
                try {
                    const cloudFavorites = await loadFavoritesFromCloud(userId);
                    if (
                        cloudFavorites &&
                        cloudFavorites.length > 0 &&
                        JSON.stringify(cloudFavorites) !== JSON.stringify(localFavorites)
                    ) {
                        setFavorites(cloudFavorites);
                        await saveFavorites(userId, cloudFavorites);
                    } else if (localFavorites.length > 0 && (!cloudFavorites || cloudFavorites.length === 0)) {
                        await saveFavoritesToCloud(userId, localFavorites);
                    }
                    const cloudRecent = await loadRecentFromCloud(userId);
                    if (
                        cloudRecent &&
                        cloudRecent.length > 0 &&
                        JSON.stringify(cloudRecent) !== JSON.stringify(localRecent)
                    ) {
                        setRecentHymns(cloudRecent);
                        await saveRecentHymns(userId, cloudRecent);
                    } else if (localRecent.length > 0 && (!cloudRecent || cloudRecent.length === 0)) {
                        await saveRecentToCloud(userId, localRecent);
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

export const toggleFavorite = async (hymn, favorites, setFavorites) => {
    const newFavorites = favorites.find((fav) => fav.id === hymn.id)
        ? favorites.filter((fav) => fav.id !== hymn.id)
        : [...favorites, hymn];
    setFavorites(newFavorites);
    await saveFavoritesHandler(hymn.userId, newFavorites);
};

export const addToRecent = async (hymn, recentHymns, setRecentHymns, userId, syncFavorites, isOffline) => {
    const newRecent = [hymn, ...recentHymns.filter((recent) => recent.id !== hymn.id)].slice(0, 20);
    setRecentHymns(newRecent);
    await saveRecentHymnsHandler(userId, newRecent, syncFavorites, isOffline);
};

export const clearRecentHymns = async (userId, setRecentHymns) => {
    try {
        setRecentHymns([]);
        await saveRecentHymns(userId, []);
    } catch (error) {
        console.error('Error clearing recent hymns:', error);
        throw error;
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
