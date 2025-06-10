import * as SQLite from 'expo-sqlite';

const database = SQLite.openDatabaseSync('hymns');

export const init = async () => {
    try {
        const tableExists = await database.getFirstAsync(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='hymns'"
        );

        if (!tableExists) {
            await database.runAsync(`
                CREATE TABLE IF NOT EXISTS hymns (
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
                                                     UNIQUE(hymn_number)
                    )
            `);
        } else {
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
    } catch (error) {
        console.error("Error initializing database:", error);
        throw error;
    }
}

export const fetchHymns = async () => {
    try {
        const result = await database.getAllAsync('SELECT * FROM hymns ORDER BY hymn_number');
        return constructHymns(result);
    } catch (error) {
        console.error("Error fetching hymns:", error);
        throw error;
    }
}

// Fetch single hymn by firebase_id for offline details
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

// Check if hymns exist locally
export const hasLocalHymns = async () => {
    try {
        const result = await database.getFirstAsync('SELECT COUNT(*) as count FROM hymns');
        return result.count > 0;
    } catch (error) {
        console.error("Error checking local hymns:", error);
        return false;
    }
}

// Get count of local hymns - NEW METHOD for Settings
export const getLocalHymnCount = async () => {
    try {
        const result = await database.getFirstAsync('SELECT COUNT(*) as count FROM hymns');
        return result.count || 0;
    } catch (error) {
        console.error("Error getting local hymn count:", error);
        return 0;
    }
}

// Get storage size estimate - NEW METHOD for Settings
export const getLocalStorageSize = async () => {
    try {
        const result = await database.getFirstAsync(`
            SELECT 
                COUNT(*) as count,
                SUM(LENGTH(title) + LENGTH(stanzas) + LENGTH(IFNULL(refrains, '')) + LENGTH(IFNULL(doh, ''))) as totalSize
            FROM hymns
        `);
        return {
            count: result.count || 0,
            estimatedSizeKB: Math.round((result.totalSize || 0) / 1024)
        };
    } catch (error) {
        console.error("Error calculating storage size:", error);
        return { count: 0, estimatedSizeKB: 0 };
    }
}

export const insertHymn = async (hymnData) => {
    try {
        const { id: firebaseId, number, origin, doh, title, stanzas, refrains, category, updatedAt } = hymnData;

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

export const updateHymn = async (id, hymnData) => {
    try {
        const { number, origin, doh, title, stanzas, refrains, category, updatedAt } = hymnData;

        return await database.runAsync(
            'UPDATE hymns SET hymn_number = ?, origin = ?, doh = ?, title = ?, stanzas = ?, refrains = ?, category = ?, updatedAt = ? WHERE id = ?',
            [
                number,
                origin,
                doh,
                title,
                JSON.stringify(stanzas),
                refrains ? JSON.stringify(refrains) : null,
                category,
                updatedAt || null,
                id
            ]
        );
    } catch (error) {
        console.error("Error updating hymn:", error);
        throw error;
    }
}

// Update hymn by firebase_id instead of local id
export const updateHymnByFirebaseId = async (firebaseId, hymnData) => {
    try {
        const { number, origin, doh, title, stanzas, refrains, category, updatedAt } = hymnData;

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

export const bulkInsertHymns = async (hymnsArray) => {
    try {
        await database.runAsync('BEGIN TRANSACTION');

        for (const hymn of hymnsArray) {
            await insertHymn(hymn);
        }

        await database.runAsync('COMMIT');
        console.log(`Successfully inserted ${hymnsArray.length} hymns`);
    } catch (error) {
        await database.runAsync('ROLLBACK');
        console.error("Error bulk inserting hymns:", error);
        throw error;
    }
}

// Improved sync function that merges instead of deleting all
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

// Get last sync time from local data
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

// Clear all hymns - UPDATED for Settings usage
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

// NEW: Check if specific hymn exists locally by firebase_id
export const hymnExistsLocally = async (firebaseId) => {
    try {
        const result = await database.getFirstAsync(
            'SELECT COUNT(*) as count FROM hymns WHERE firebase_id = ?',
            [firebaseId]
        );
        return result.count > 0;
    } catch (error) {
        console.error("Error checking if hymn exists locally:", error);
        return false;
    }
}

// NEW: Get list of firebase_ids for locally stored hymns
export const getLocalHymnIds = async () => {
    try {
        const result = await database.getAllAsync('SELECT firebase_id FROM hymns ORDER BY hymn_number');
        return result.map(row => row.firebase_id);
    } catch (error) {
        console.error("Error getting local hymn IDs:", error);
        return [];
    }
}

// NEW: Get hymns that need to be updated (based on updatedAt timestamp)
export const getHymnsNeedingUpdate = async (serverHymns) => {
    try {
        const needsUpdate = [];

        for (const serverHymn of serverHymns) {
            const localHymn = await database.getFirstAsync(
                'SELECT updatedAt FROM hymns WHERE firebase_id = ?',
                [serverHymn.id]
            );

            if (!localHymn ||
                !localHymn.updatedAt ||
                new Date(serverHymn.updatedAt) > new Date(localHymn.updatedAt)) {
                needsUpdate.push(serverHymn);
            }
        }

        return needsUpdate;
    } catch (error) {
        console.error("Error checking hymns needing update:", error);
        return serverHymns; // Return all if error, to be safe
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
