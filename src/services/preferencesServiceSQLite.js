import {
    syncPreferences as cloudSyncPreferences
} from './preferencesService';
import database from "../utils/database";

export const initPreferencesDB = async () => {
    try {
        return await database.runAsync(`
            CREATE TABLE IF NOT EXISTS user_preferences (
                id INTEGER PRIMARY KEY NOT NULL,
                user_id TEXT NOT NULL,
                preferences TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id)
            )
        `);
    } catch (error) {
        console.error("Error initializing preferences database:", error);
        throw error;
    }
};

export const savePreferencesToDB = async (userId, preferences) => {
    try {
        const preferencesJson = JSON.stringify(preferences);
        return await database.runAsync(
            `INSERT OR REPLACE INTO user_preferences (user_id, preferences, updated_at) 
             VALUES (?, ?, CURRENT_TIMESTAMP)`,
            [userId, preferencesJson]
        );
    } catch (error) {
        console.error("Error saving preferences to database:", error);
        throw error;
    }
};

export const loadPreferencesFromDB = async (userId) => {
    try {
        const result = await database.getFirstAsync(
            'SELECT preferences FROM user_preferences WHERE user_id = ?',
            [userId]
        );

        if (result && result.preferences) {
            return JSON.parse(result.preferences);
        }
        return null;
    } catch (error) {
        console.error("Error loading preferences from database:", error);
        throw error;
    }
};

export const deletePreferencesFromDB = async (userId) => {
    try {
        await database.runAsync(
            'DELETE FROM user_preferences WHERE user_id = ?',
            [userId]
        );
    } catch (error) {
        console.error("Error deleting preferences from database:", error);
        throw error;
    }
};

export const getAllUsersPreferences = async () => {
    try {
        const result = await database.getAllAsync(
            'SELECT user_id, preferences, updated_at FROM user_preferences ORDER BY updated_at DESC'
        );

        return result.map(row => ({
            userId: row.user_id,
            preferences: JSON.parse(row.preferences),
            updatedAt: row.updated_at
        }));
    } catch (error) {
        console.error("Error getting all users preferences:", error);
        throw error;
    }
};

export const syncPreferences = async (userId, localPreferences) => {
    try {
        // Use the existing cloud sync service
        return await cloudSyncPreferences(userId, localPreferences);
    } catch (error) {
        console.error("Error syncing preferences:", error);
        throw error;
    }
};

export const clearAllPreferences = async () => {
    try {
        await database.runAsync('DELETE FROM user_preferences');
        console.log("All preferences cleared from database");
    } catch (error) {
        console.error("Error clearing preferences:", error);
        throw error;
    }
};
