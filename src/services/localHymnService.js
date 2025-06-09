import * as SQLite from 'expo-sqlite';

const database = SQLite.openDatabaseSync('hymns');

export const init = async () => {
    try {
        // Drop existing table if it exists to recreate with new schema
        await database.runAsync('DROP TABLE IF EXISTS hymns');

        return await database.runAsync(`
            CREATE TABLE IF NOT EXISTS hymns (
                id INTEGER PRIMARY KEY NOT NULL,
                hymn_number INTEGER NOT NULL,
                origin TEXT NOT NULL,
                doh TEXT NULL,
                title TEXT NOT NULL,
                stanzas TEXT NOT NULL,
                refrains TEXT NULL,
                category TEXT NULL,
                UNIQUE(hymn_number)
            )
        `);
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

export const fetchHymnByNumber = async (hymnNumber) => {
    try {
        const result = await database.getFirstAsync(
            'SELECT * FROM hymns WHERE hymn_number = ?',
            [hymnNumber]
        );
        return result ? constructHymns([result])[0] : null;
    } catch (error) {
        console.error("Error fetching hymn by number:", error);
        throw error;
    }
}

export const insertHymn = async (hymnData) => {
    try {
        const { number, origin, doh, title, stanzas, refrains, category } = hymnData;

        return await database.runAsync(
            'INSERT OR REPLACE INTO hymns (hymn_number, origin, doh, title, stanzas, refrains, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                number,
                origin,
                doh,
                title,
                JSON.stringify(stanzas),
                refrains ? JSON.stringify(refrains) : null,
                category
            ]
        );
    } catch (error) {
        console.error("Error inserting hymn:", error);
        throw error;
    }
}

export const updateHymn = async (id, hymnData) => {
    try {
        const { number, origin, doh, title, stanzas, refrains, category } = hymnData;

        return await database.runAsync(
            'UPDATE hymns SET hymn_number = ?, origin = ?, doh = ?, title = ?, stanzas = ?, refrains = ?, category = ? WHERE id = ?',
            [
                number,
                origin,
                doh,
                title,
                JSON.stringify(stanzas),
                refrains ? JSON.stringify(refrains) : null,
                category,
                id
            ]
        );
    } catch (error) {
        console.error("Error updating hymn:", error);
        throw error;
    }
}

export const deleteHymn = async (id) => {
    try {
        await database.runAsync(
            'DELETE FROM hymns WHERE id = ?',
            [id]
        );
    } catch (error) {
        console.error("Error deleting hymn:", error);
        throw error;
    }
};

export const searchHymns = async (searchQuery) => {
    try {
        if (!searchQuery || !searchQuery.trim()) {
            return [];
        }

        const query = `%${searchQuery.toLowerCase()}%`;
        const result = await database.getAllAsync(
            `SELECT * FROM hymns 
             WHERE LOWER(title) LIKE ? 
                OR CAST(hymn_number AS TEXT) LIKE ? 
                OR LOWER(origin) LIKE ?
                OR LOWER(stanzas) LIKE ?
             ORDER BY hymn_number`,
            [query, query, query, query]
        );
        return constructHymns(result);
    } catch (error) {
        console.error("Error searching hymns:", error);
        throw error;
    }
}

export const bulkInsertHymns = async (hymnsArray) => {
    try {
        // Begin transaction for better performance
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

export const syncHymns = async (hymnsData) => {
    try {
        // Clear existing data and insert new data
        await database.runAsync('DELETE FROM hymns');
        await bulkInsertHymns(hymnsData);

        console.log("Hymns synchronized successfully");
        return true;
    } catch (error) {
        console.error("Error syncing hymns:", error);
        throw error;
    }
}

export const getHymnStats = async () => {
    try {
        const totalResult = await database.getFirstAsync('SELECT COUNT(*) as total FROM hymns');
        const originsResult = await database.getAllAsync(
            'SELECT origin, COUNT(*) as count FROM hymns GROUP BY origin ORDER BY count DESC'
        );

        return {
            total: totalResult.total,
            byOrigin: originsResult
        };
    } catch (error) {
        console.error("Error getting hymn stats:", error);
        throw error;
    }
}

const constructHymns = (rows) => {
    const hymns = [];
    for (const row of rows) {
        hymns.push({
            id: row.id,
            number: row.hymn_number,
            origin: row.origin,
            doh: row.doh,
            title: row.title,
            stanzas: row.stanzas ? JSON.parse(row.stanzas) : [],
            refrains: row.refrains ? JSON.parse(row.refrains) : [],
            category: row.category
        });
    }
    return hymns;
}

// Helper function to validate hymn data structure
export const validateHymnData = (hymnData) => {
    const required = ['number', 'origin', 'title', 'stanzas'];
    const missing = required.filter(field => !hymnData[field]);

    if (missing.length > 0) {
        throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    if (!Array.isArray(hymnData.stanzas) || hymnData.stanzas.length === 0) {
        throw new Error('Stanzas must be a non-empty array');
    }

    if (hymnData.refrains && !Array.isArray(hymnData.refrains)) {
        throw new Error('Refrains must be an array if provided');
    }

    return true;
}
