import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from './UserContext';
import {
    savePreferencesToCloud,
    loadPreferencesFromCloud,
} from '../services/preferencesService';
import {
    initPreferencesDB,
    savePreferencesToDB,
    loadPreferencesFromDB,
    deletePreferencesFromDB,
    syncPreferences as syncPreferencesWithCloud
} from '../services/preferencesServiceSQLite';
import { useTheme } from "./ThemeContext";

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
    offlineTunes: false,
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
    const [dbInitialized, setDbInitialized] = useState(false);
    const { updateTheme } = useTheme();

    // Initialize database on app start
    useEffect(() => {
        const initDB = async () => {
            try {
                await initPreferencesDB();
                setDbInitialized(true);
            } catch (error) {
                console.error('Failed to initialize preferences database:', error);
            }
        };
        initDB();
    }, []);

    // Load preferences when user changes and DB is initialized
    useEffect(() => {
        if (!dbInitialized) return;

        let isCancelled = false;

        const loadPreferences = async () => {
            setLoading(true);
            try {
                if (user?.uid) {
                    // Load from SQLite
                    const localPreferences = await loadPreferencesFromDB(user.uid);
                    const mergedPrefs = { ...DEFAULT_PREFERENCES, ...(localPreferences || {}) };

                    if (isCancelled) return;
                    setPreferences(mergedPrefs);

                    // Update theme immediately when preferences are loaded
                    if (mergedPrefs.theme) {
                        updateTheme(mergedPrefs.theme);
                    }

                    // Sync with cloud if enabled
                    if (mergedPrefs.syncFavorites) {
                        try {
                            setSyncing(true);
                            const syncedPreferences = await syncPreferencesWithCloud(user.uid, mergedPrefs);
                            if (isCancelled) return;

                            if (JSON.stringify(syncedPreferences) !== JSON.stringify(mergedPrefs)) {
                                setPreferences(syncedPreferences);
                                await savePreferencesToDB(user.uid, syncedPreferences);

                                // Update theme again if it changed after sync
                                if (syncedPreferences.theme && syncedPreferences.theme !== mergedPrefs.theme) {
                                    updateTheme(syncedPreferences.theme);
                                }
                            }
                        } catch (err) {
                            console.error('Sync failed, using local preferences:', err.message);
                        } finally {
                            setSyncing(false);
                        }
                    }
                } else {
                    // User not logged in, load guest preferences from AsyncStorage
                    try {
                        const guestPrefs = await AsyncStorage.getItem('guestPreferences');
                        if (guestPrefs) {
                            const parsedPrefs = JSON.parse(guestPrefs);
                            const mergedPrefs = { ...DEFAULT_PREFERENCES, ...parsedPrefs };
                            setPreferences(mergedPrefs);
                            updateTheme(mergedPrefs.theme);
                        } else {
                            setPreferences(DEFAULT_PREFERENCES);
                            updateTheme(DEFAULT_PREFERENCES.theme);
                        }
                    } catch (error) {
                        console.error('Error loading guest preferences:', error);
                        setPreferences(DEFAULT_PREFERENCES);
                        updateTheme(DEFAULT_PREFERENCES.theme);
                    }
                }
            } catch (err) {
                console.error('Error loading preferences:', err);
                setPreferences(DEFAULT_PREFERENCES);
                updateTheme(DEFAULT_PREFERENCES.theme);
            } finally {
                if (!isCancelled) setLoading(false);
            }
        };

        loadPreferences();

        return () => {
            isCancelled = true;
        };
    }, [user?.uid, dbInitialized, updateTheme]);

    // Save preferences to SQLite and optionally to cloud
    const savePreferences = async (newPreferences) => {
        try {
            if (user?.uid) {
                // Save to SQLite
                await savePreferencesToDB(user.uid, newPreferences);

                // Save to cloud if sync is enabled
                if (newPreferences.syncFavorites) {
                    try {
                        await savePreferencesToCloud(user.uid, newPreferences);
                    } catch (cloudError) {
                        console.error('Cloud sync failed, preferences saved locally:', cloudError.message);
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

            // If theme preference is being updated, notify ThemeProvider immediately
            if (key === 'theme') {
                updateTheme(value);
            }

            // Save preferences regardless of login status
            if (user?.uid) {
                await savePreferences(newPreferences);
            } else {
                // Save to AsyncStorage when not logged in
                try {
                    await AsyncStorage.setItem('guestPreferences', JSON.stringify(newPreferences));
                } catch (error) {
                    console.error('Error saving guest preferences:', error);
                }
            }
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

            // Save preferences regardless of login status
            if (user?.uid) {
                await savePreferences(newPreferences);
            } else {
                // Save to AsyncStorage when not logged in
                try {
                    await AsyncStorage.setItem('guestPreferences', JSON.stringify(newPreferences));
                } catch (error) {
                    console.error('Error saving guest preferences:', error);
                }
            }
        } catch (error) {
            console.error('Error updating nested preference:', error);
            throw error;
        }
    };

    // Reset preferences to defaults
    const resetPreferences = async () => {
        try {
            setPreferences(DEFAULT_PREFERENCES);
            // Update theme to default
            updateTheme(DEFAULT_PREFERENCES.theme);
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

            // Update theme from imported preferences
            if (mergedPrefs.theme) {
                updateTheme(mergedPrefs.theme);
            }

            await savePreferences(mergedPrefs);
        } catch (error) {
            console.error('Error importing preferences:', error);
            throw error;
        }
    };

    // Force sync with cloud
    const handleForceSyncWithCloud = async () => {
        if (!user?.uid) {
            throw new Error('User not logged in');
        }

        try {
            setSyncing(true);
            const cloudPreferences = await loadPreferencesFromCloud(user.uid);

            if (cloudPreferences) {
                const mergedPrefs = { ...DEFAULT_PREFERENCES, ...cloudPreferences };
                setPreferences(mergedPrefs);

                // Update theme from cloud preferences
                if (mergedPrefs.theme) {
                    updateTheme(mergedPrefs.theme);
                }

                await savePreferencesToDB(user.uid, mergedPrefs);
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

    // Clear user preferences (on logout)
    const clearUserPreferences = async () => {
        try {
            if (user?.uid) {
                await deletePreferencesFromDB(user.uid);
            }
            setPreferences(DEFAULT_PREFERENCES);
            // Reset theme to default
            updateTheme(DEFAULT_PREFERENCES.theme);
        } catch (error) {
            console.error('Error clearing user preferences:', error);
            throw error;
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
        handleForceSyncWithCloud,
        clearUserPreferences,
        isLoggedIn: !!user?.uid,
        dbInitialized
    };

    return (
        <PreferencesContext.Provider value={value}>
            {children}
        </PreferencesContext.Provider>
    );
};
