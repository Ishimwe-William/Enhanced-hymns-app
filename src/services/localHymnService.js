import database from '../utils/database';

export const init = async () => {
    try {
        // Enable WAL mode for better concurrency
        await database.runAsync('PRAGMA journal_mode = WAL');

        // Perform all initialization steps in a single transaction
        await database.withTransactionAsync(async () => {
            // Check if the 'hymns' table exists
            const tableExists = await database.getFirstAsync(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='hymns'"
            );

            if (!tableExists) {
                // Create the 'hymns' table if it doesn’t exist
                await database.runAsync(`
                    CREATE TABLE IF NOT EXISTS hymns
                    (
                        id INTEGER PRIMARY KEY NOT NULL,
                        firebase_id TEXT NOT NULL UNIQUE,
                        hymn_number INTEGER NOT NULL,
                        origin TEXT NOT NULL,
                        doh TEXT NULL,
                        title TEXT NOT NULL,
                        stanzas TEXT NOT NULL,
                        refrains TEXT NULL,
                        category TEXT NULL,
                        updatedAt TEXT NULL,
                        UNIQUE (hymn_number)
                    )
                `);
            } else {
                // Check for missing columns and add them if needed
                const columns = await database.getAllAsync("PRAGMA table_info(hymns)");
                const hasFirebaseId = columns.some(col => col.name === 'firebase_id');
                const hasUpdatedAt = columns.some(col => col.name === 'updatedAt');
                if (!hasFirebaseId) {
                    await database.runAsync("ALTER TABLE hymns ADD COLUMN firebase_id TEXT NOT NULL DEFAULT ''");
                }
                if (!hasUpdatedAt) {
                    await database.runAsync("ALTER TABLE hymns ADD COLUMN updatedAt TEXT NULL");
                }
            }

            // Optional: Initialize other tables (e.g., 'user_data') if your app uses them
            const userTableExists = await database.getFirstAsync(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='user_data'"
            );
            if (!userTableExists) {
                await database.runAsync(`
                    CREATE TABLE IF NOT EXISTS user_data
                    (
                        id INTEGER PRIMARY KEY NOT NULL,
                        user_id TEXT NOT NULL,
                        favorites TEXT,
                        recent_hymns TEXT,
                        UNIQUE (user_id)
                    )
                `);
            }
        });
    } catch (error) {
        console.error("Error initializing database:", error);
        throw error;
    }
};

export const fetchHymns = async () => {
    try {
        const result = await database.getAllAsync('SELECT * FROM hymns ORDER BY hymn_number');
        return constructHymns(result);
    } catch (error) {
        if (error.message.includes('no such table: hymns')) {
            console.warn('Hymns table not found. Returning empty array.');
            return [];
        }
        console.error("Error fetching hymns:", error);
        throw error;
    }
};

export const fetchHymnById = async (firebaseId) => {
    try {
        const result = await database.getFirstAsync(
            'SELECT * FROM hymns WHERE firebase_id = ? or hymn_number = ?',
            [firebaseId, firebaseId]
        );
        return result ? constructHymns([result])[0] : null;
    } catch (error) {
        console.error("Error fetching hymn by ID:", error);
        throw error;
    }
}

export const hasLocalHymns = async () => {
    try {
        const result = await database.getFirstAsync('SELECT COUNT(*) as count FROM hymns');
        return result.count > 0;
    } catch (error) {
        console.error("Error checking local hymns:", error);
        return false;
    }
}

export const getLocalHymnCount = async () => {
    try {
        const result = await database.getFirstAsync('SELECT COUNT(*) as count FROM hymns');
        return result.count || 0;
    } catch (error) {
        console.error("Error getting local hymn count:", error);
        return 0;
    }
}

export const insertHymn = async (hymnData) => {
    try {
        const {id: firebaseId, number, origin, doh, title, stanzas, refrains, category, updatedAt} = hymnData;

        return await database.runAsync(
            'INSERT OR REPLACE INTO hymns (firebase_id, hymn_number, origin, doh, title, stanzas, refrains, category, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                firebaseId,
                number,
                origin,
                doh,
                title,
                JSON.stringify(stanzas),
                refrains ? JSON.stringify(refrains) : null,
                category,
                updatedAt || null
            ]
        );
    } catch (error) {
        console.error("Error inserting hymn:", error);
        throw error;
    }
}

export const updateHymnByFirebaseId = async (firebaseId, hymnData) => {
    try {
        const {number, origin, doh, title, stanzas, refrains, category, updatedAt} = hymnData;

        return await database.runAsync(
            'UPDATE hymns SET hymn_number = ?, origin = ?, doh = ?, title = ?, stanzas = ?, refrains = ?, category = ?, updatedAt = ? WHERE firebase_id = ?',
            [
                number,
                origin,
                doh,
                title,
                JSON.stringify(stanzas),
                refrains ? JSON.stringify(refrains) : null,
                category,
                updatedAt || null,
                firebaseId
            ]
        );
    } catch (error) {
        console.error("Error updating hymn by firebase ID:", error);
        throw error;
    }
}

export const syncHymns = async (hymnsData) => {
    try {
        await database.runAsync('BEGIN TRANSACTION');

        // Instead of deleting all, merge the data
        for (const hymn of hymnsData) {
            await insertHymn(hymn); // INSERT OR REPLACE handles the merge
        }

        await database.runAsync('COMMIT');
        console.log("Hymns synchronized successfully");
        return true;
    } catch (error) {
        await database.runAsync('ROLLBACK');
        console.error("Error syncing hymns:", error);
        throw error;
    }
}

export const getLastSyncTime = async () => {
    try {
        const result = await database.getFirstAsync(
            'SELECT MAX(updatedAt) as lastSync FROM hymns WHERE updatedAt IS NOT NULL'
        );
        return result?.lastSync || null;
    } catch (error) {
        console.error("Error getting last sync time:", error);
        return null;
    }
}

export const clearAllHymns = async () => {
    try {
        const result = await database.runAsync('DELETE FROM hymns');
        console.log("All hymns cleared successfully");
        return {
            success: true,
            deletedCount: result.changes || 0
        };
    } catch (error) {
        console.error("Error clearing hymns:", error);
        throw error;
    }
}

const constructHymns = (rows) => {
    return rows.map(row => ({
        id: row.id,
        firebaseId: row.firebase_id,
        number: row.hymn_number,
        origin: row.origin,
        doh: row.doh,
        title: row.title,
        stanzas: row.stanzas ? JSON.parse(row.stanzas) : [],
        refrains: row.refrains ? JSON.parse(row.refrains) : [],
        category: row.category,
        updatedAt: row.updatedAt
    }));
}
