import AsyncStorage from '@react-native-async-storage/async-storage';

// Generate key for favorites
export const getFavoritesKey = (userId) => `userFavorites_${userId}`;

// Generate key for recent hymns
export const getRecentKey = (userId) => `userRecent_${userId}`;

// Save data to SecureStore
export const saveToSecureStore = async (key, data) => {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Error saving to SecureStore with key ${key}:`, error);
        throw error;
    }
};

// Load data from SecureStore
export const loadFromSecureStore = async (key, defaultValue = null) => {
    try {
        const storedData = await AsyncStorage.getItem(key);
        return storedData ? JSON.parse(storedData) : defaultValue;
    } catch (error) {
        console.error(`Error loading from SecureStore with key ${key}:`, error);
        return defaultValue;
    }
};

// Delete data from SecureStore
export const deleteFromSecureStore = async (key) => {
    try {
        await AsyncStorage.removeItem(key);
    } catch (error) {
        console.error(`Error deleting from SecureStore with key ${key}:`, error);
        throw error;
    }
};

// Specific functions for favorites
export const saveFavorites = async (userId, favoritesData) => {
    const key = getFavoritesKey(userId);
    await saveToSecureStore(key, favoritesData);
};

export const loadFavorites = async (userId) => {
    const key = getFavoritesKey(userId);
    return await loadFromSecureStore(key, []);
};

// Specific functions for recent hymns
export const saveRecentHymns = async (userId, recentData) => {
    const key = getRecentKey(userId);
    await saveToSecureStore(key, recentData);
};

export const loadRecentHymns = async (userId) => {
    const key = getRecentKey(userId);
    return await loadFromSecureStore(key, []);
};

// Specific functions for last sync time
export const saveLastSyncTime = async (syncTime) => {
    await saveToSecureStore('lastSyncTime', syncTime);
};

export const loadLastSyncTime = async () => {
    return await loadFromSecureStore('lastSyncTime', null);
};

export const deleteLastSyncTime = async () => {
    await deleteFromSecureStore('lastSyncTime');
};
