import * as SQLite from 'expo-sqlite';

const database = SQLite.openDatabaseSync('hymns');

export const init = async () => {
    try {
        return await database.runAsync(`
            CREATE TABLE IF NOT EXISTS hymns
            (
                id
                INTEGER
                PRIMARY
                KEY
                NOT
                NULL,
                doh
                TEXT
                NULL,
                hymn_number
                INTEGER
                NOT
                NULL,
                origin
                TEXT
                NOT
                NULL,
                title
                TEXT
                NOT
                NULL,
                refrains
                TEXT,
                stanzas
                TEXT,
                category
                TEXT
            )
        `);
    } catch (error) {
        console.error("Error initializing database:", error);
        throw error;
    }
}

export const fetchHymns = async () => {
    try {
        const result = await database.getAllAsync('SELECT * FROM hymns');
        return constructHymns(result);
    } catch (error) {
        console.error("Error fetching hymns:", error);
        throw error;
    }
}

export const insertHymn = async (doh, number, origin, title, refrains, stanzas, category) => {
    try {
        return await database.runAsync(
            'INSERT INTO hymns (doh, hymn_number, origin, title, refrains, stanzas, category) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [doh, number, origin, title, JSON.stringify(refrains), JSON.stringify(stanzas), category]
        );
    } catch (error) {
        console.error("Error inserting hymn:", error);
        throw error;
    }
}

export const updateHymn = async (id, doh, number, origin, title, refrains, stanzas, category) => {
    try {
        const hymn = await database.runAsync(
            'UPDATE hymns SET doh = ?, hymn_number = ?, origin = ?, title = ?, refrains = ?, stanzas = ?, category = ? WHERE id = ?',
            [doh, number, origin, title, JSON.stringify(refrains), JSON.stringify(stanzas), category, id]
        );
        return hymn;
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
            `SELECT *
             FROM hymns
             WHERE LOWER(title) LIKE ?
                OR CAST(hymn_number AS TEXT) LIKE ?
                OR LOWER(origin) LIKE ?`,
            [query, query, query]
        );
        return constructHymns(result);
    } catch (error) {
        console.error("Error searching hymns:", error);
        throw error;
    }
}

const constructHymns = (rows) => {
    const hymns = [];
    for (const row of rows) {
        hymns.push({
            id: row.id,
            title: row.title,
            doh: row.doh,
            number: row.hymn_number,
            origin: row.origin,
            refrains: row.refrains ? JSON.parse(row.refrains) : null,
            stanzas: row.stanzas ? JSON.parse(row.stanzas) : null,
            category: row.category
        });
    }
    return hymns;
}
