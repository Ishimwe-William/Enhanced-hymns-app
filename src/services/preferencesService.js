import { doc, setDoc, getDoc, serverTimestamp} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { Alert } from 'react-native';

export const savePreferencesToCloud = async (userId, preferences) => {
    try {
        const userPrefsRef = doc(db, 'userPreferences', userId);
        await setDoc(userPrefsRef, {
            preferences,
            lastUpdated: serverTimestamp(),
            userId,
        }, { merge: true });
        console.log('Preferences saved to cloud successfully');
        return true;
    } catch (error) {
        console.error('Error saving preferences to cloud:', error);
        Alert.alert('Sync Error', 'Failed to save preferences to cloud');
        throw error;
    }
};

export const loadPreferencesFromCloud = async (userId) => {
    try {
        const userPrefsRef = doc(db, 'userPreferences', userId);
        const docSnap = await getDoc(userPrefsRef);

        if (docSnap.exists()) {
            console.log('Preferences loaded from cloud successfully');
            return docSnap.data().preferences;
        }
        console.log('No cloud preferences found for user');
        return null;
    } catch (error) {
        console.error('Error loading preferences from cloud:', error);
        Alert.alert('Sync Error', 'Failed to load preferences from cloud');
        throw error;
    }
};

export const syncPreferences = async (userId, localPreferences) => {
    try {
        // Get cloud preferences
        const cloudPreferences = await loadPreferencesFromCloud(userId);

        if (!cloudPreferences) {
            // No cloud preferences, save local ones
            await savePreferencesToCloud(userId, localPreferences);
            console.log('Local preferences synced to cloud');
            return localPreferences;
        }

        // Here you could implement conflict resolution logic
        // For now, we'll use cloud preferences if they exist
        console.log('Using cloud preferences');
        return cloudPreferences;
    } catch (error) {
        console.error('Error syncing preferences:', error);
        // Return local preferences if sync fails
        return localPreferences;
    }
};

// Save user favorites to cloud
export const saveFavoritesToCloud = async (userId, favorites) => {
    try {
        const userFavoritesRef = doc(db, 'userFavorites', userId);
        await setDoc(userFavoritesRef, {
            favorites,
            lastUpdated: serverTimestamp(),
            userId,
        }, { merge: true });
        console.log('Favorites saved to cloud successfully');
        return true;
    } catch (error) {
        console.error('Error saving favorites to cloud:', error);
        Alert.alert('Sync Error', 'Failed to save favorites to cloud');
        throw error;
    }
};

// Load user favorites from cloud
export const loadFavoritesFromCloud = async (userId) => {
    try {
        const userFavoritesRef = doc(db, 'userFavorites', userId);
        const docSnap = await getDoc(userFavoritesRef);

        if (docSnap.exists()) {
            console.log('Favorites loaded from cloud successfully');
            return docSnap.data().favorites || [];
        }
        console.log('No cloud favorites found for user');
        return [];
    } catch (error) {
        console.error('Error loading favorites from cloud:', error);
        Alert.alert('Sync Error', 'Failed to load favorites from cloud');
        return [];
    }
};

// Save user recent hymns to cloud
export const saveRecentToCloud = async (userId, recentHymns) => {
    try {
        const userRecentRef = doc(db, 'userRecent', userId);
        await setDoc(userRecentRef, {
            recentHymns,
            lastUpdated: serverTimestamp(),
            userId,
        }, { merge: true });
        console.log('Recent hymns saved to cloud successfully');
        return true;
    } catch (error) {
        console.error('Error saving recent hymns to cloud:', error);
        // Don't show alert for recent hymns as it's less critical
        throw error;
    }
};

// Load user recent hymns from cloud
export const loadRecentFromCloud = async (userId) => {
    try {
        const userRecentRef = doc(db, 'userRecent', userId);
        const docSnap = await getDoc(userRecentRef);

        if (docSnap.exists()) {
            console.log('Recent hymns loaded from cloud successfully');
            return docSnap.data().recentHymns || [];
        }
        console.log('No cloud recent hymns found for user');
        return [];
    } catch (error) {
        console.error('Error loading recent hymns from cloud:', error);
        return [];
    }
};
