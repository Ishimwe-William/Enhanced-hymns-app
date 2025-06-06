import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from './UserContext';
import * as SecureStore from 'expo-secure-store';
import {
    savePreferencesToCloud,
    loadPreferencesFromCloud,
    syncPreferences
} from '../services/preferencesService';

const PreferencesContext = createContext();

export const usePreferences = () => {
    const context = useContext(PreferencesContext);
    if (!context) {
        throw new Error('usePreferences must be used within a PreferencesProvider');
    }
    return context;
};

const DEFAULT_PREFERENCES = {
    version: 1,
    fontSize: 'medium', // small, medium, large
    theme: 'light', // light, dark
    offlineDownload: false,
    syncFavorites: true,
    notifications: {
        enabled: true,
        dailyReminder: false,
        newHymns: true,
    },
    display: {
        showChords: true,
        showVerseNumbers: true,
        lineSpacing: 'normal', // compact, normal, loose
    }
};

export const PreferencesProvider = ({ children }) => {
    const { user } = useUser();
    const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    // Generate storage key based on user ID
    const getStorageKey = (userId) => `userPreferences_${userId}`;

    // Load preferences when user changes
    useEffect(() => {
        let isCancelled = false;

        const loadPreferences = async () => {
            setLoading(true);
            try {
                if (user?.uid) {
                    const storageKey = getStorageKey(user.uid);
                    const storedPrefs = await SecureStore.getItemAsync(storageKey);
                    if (isCancelled) return;

                    // Merge with defaults
                    let localPreferences = { ...DEFAULT_PREFERENCES, ...(storedPrefs ? JSON.parse(storedPrefs) : {}) };
                    setPreferences(localPreferences);

                    if (localPreferences.syncFavorites) {
                        try {
                            setSyncing(true);
                            const syncedPreferences = await syncPreferences(user.uid, localPreferences);
                            if (isCancelled) return;

                            if (JSON.stringify(syncedPreferences) !== JSON.stringify(localPreferences)) {
                                setPreferences(syncedPreferences);
                                await SecureStore.setItemAsync(storageKey, JSON.stringify(syncedPreferences));
                            }
                        } catch (err) {
                            console.log('Sync failed, using local preferences');
                        } finally {
                            setSyncing(false);
                        }
                    }
                } else {
                    setPreferences(DEFAULT_PREFERENCES);
                }
            } catch (err) {
                console.error('Error loading preferences:', err);
                setPreferences(DEFAULT_PREFERENCES);
            } finally {
                if (!isCancelled) setLoading(false);
            }
        };

        loadPreferences();

        return () => {
            isCancelled = true;
        };
    }, [user?.uid]);


    // Save preferences to secure store and optionally to cloud
    const savePreferences = async (newPreferences) => {
        try {
            if (user?.uid) {
                const storageKey = getStorageKey(user.uid);
                await SecureStore.setItemAsync(storageKey, JSON.stringify(newPreferences));

                // Save to cloud if sync is enabled
                if (newPreferences.syncFavorites) {
                    try {
                        await savePreferencesToCloud(user.uid, newPreferences);
                    } catch (cloudError) {
                        console.log('Cloud sync failed, preferences saved locally');
                    }
                }
            }
        } catch (error) {
            console.error('Error saving preferences:', error);
            throw error;
        }
    };

    // Update a specific preference
    const updatePreference = async (key, value) => {
        try {
            const newPreferences = { ...preferences, [key]: value };
            setPreferences(newPreferences);
            await savePreferences(newPreferences);
        } catch (error) {
            console.error('Error updating preference:', error);
            throw error;
        }
    };

    // Update nested preference (e.g., notifications.enabled)
    const updateNestedPreference = async (parentKey, childKey, value) => {
        try {
            const newPreferences = {
                ...preferences,
                [parentKey]: {
                    ...preferences[parentKey],
                    [childKey]: value
                }
            };
            setPreferences(newPreferences);
            await savePreferences(newPreferences);
        } catch (error) {
            console.error('Error updating nested preference:', error);
            throw error;
        }
    };

    // Reset preferences to defaults
    const resetPreferences = async () => {
        try {
            setPreferences(DEFAULT_PREFERENCES);
            await savePreferences(DEFAULT_PREFERENCES);
        } catch (error) {
            console.error('Error resetting preferences:', error);
            throw error;
        }
    };

    // Export preferences (for backup)
    const exportPreferences = () => {
        return JSON.stringify(preferences, null, 2);
    };

    // Import preferences (from backup)
    const importPreferences = async (preferencesJson) => {
        try {
            const importedPrefs = JSON.parse(preferencesJson);
            const mergedPrefs = { ...DEFAULT_PREFERENCES, ...importedPrefs };
            setPreferences(mergedPrefs);
            await savePreferences(mergedPrefs);
        } catch (error) {
            console.error('Error importing preferences:', error);
            throw error;
        }
    };

    // Force sync with cloud
    const forceSyncWithCloud = async () => {
        if (!user?.uid) return false;

        try {
            setSyncing(true);
            const cloudPreferences = await loadPreferencesFromCloud(user.uid);

            if (cloudPreferences) {
                const mergedPrefs = { ...DEFAULT_PREFERENCES, ...cloudPreferences };
                setPreferences(mergedPrefs);

                const storageKey = getStorageKey(user.uid);
                await SecureStore.setItemAsync(storageKey, JSON.stringify(mergedPrefs));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error syncing with cloud:', error);
            throw error;
        } finally {
            setSyncing(false);
        }
    };

    const value = {
        preferences,
        loading,
        syncing,
        updatePreference,
        updateNestedPreference,
        resetPreferences,
        exportPreferences,
        importPreferences,
        forceSyncWithCloud,
        isLoggedIn: !!user?.uid,
    };

    return (
        <PreferencesContext.Provider value={value}>
            {children}
        </PreferencesContext.Provider>
    );
};
