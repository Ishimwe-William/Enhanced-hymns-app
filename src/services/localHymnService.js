import database from '../utils/database';



/* ------------------------------------------------------------------ */
/*  INITIALISATION                                                    */
/* ------------------------------------------------------------------ */
export const init = async () => {
    try {
        await database.runAsync('PRAGMA journal_mode = WAL');

        await database.withTransactionAsync(async () => {
            /* ── 1.  Create table if it doesn’t exist ───────────────────── */
            const tableExists = await database.getFirstAsync(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='hymns'"
            );

            if (!tableExists) {
                await database.runAsync(`
          CREATE TABLE IF NOT EXISTS hymns (
            id            INTEGER PRIMARY KEY NOT NULL,
            firebase_id   TEXT    NOT NULL UNIQUE,
            hymn_number   INTEGER NOT NULL,
            origin        TEXT    NOT NULL,
            doh           TEXT,
            title         TEXT    NOT NULL,
            stanzas       TEXT    NOT NULL,
            refrains      TEXT,
            category      TEXT,
            audio_url     TEXT,                  
            updatedAt     TEXT,
            UNIQUE (hymn_number)
          );
        `);
            } else {
                /* ── 2.  Add missing columns when upgrading ───────────────── */
                const cols   = await database.getAllAsync('PRAGMA table_info(hymns)');
                const hasCol = n => cols.some(c => c.name === n);

                if (!hasCol('firebase_id')) await database.runAsync(
                    "ALTER TABLE hymns ADD COLUMN firebase_id TEXT NOT NULL DEFAULT ''"
                );
                if (!hasCol('updatedAt'))   await database.runAsync(
                    "ALTER TABLE hymns ADD COLUMN updatedAt TEXT"
                );
                if (!hasCol('audio_url'))   await database.runAsync(
                    "ALTER TABLE hymns ADD COLUMN audio_url TEXT"
                );
            }

            /* ── 3.  Optional user_data table ───────────────────────────── */
            const userTableExists = await database.getFirstAsync(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='user_data'"
            );
            if (!userTableExists) {
                await database.runAsync(`
          CREATE TABLE IF NOT EXISTS user_data (
            id            INTEGER PRIMARY KEY NOT NULL,
            user_id       TEXT NOT NULL UNIQUE,
            favorites     TEXT,
            recent_hymns  TEXT
          );
        `);
            }
        });
    } catch (err) {
        console.error('Error initializing database:', err);
        throw err;
    }
};

/* ------------------------------------------------------------------ */
/*  CRUD HELPERS                                                      */
/* ------------------------------------------------------------------ */

export const fetchHymns = async () => {
    try {
        const rows = await database.getAllAsync('SELECT * FROM hymns ORDER BY hymn_number');
        return constructHymns(rows);
    } catch (err) {
        if (err.message.includes('no such table: hymns')) return [];
        console.error('Error fetching hymns:', err);
        throw err;
    }
};

export const fetchHymnById = async (firebaseId) => {
    try {
        const row = await database.getFirstAsync(
            'SELECT * FROM hymns WHERE firebase_id = ? OR hymn_number = ?',
            [firebaseId, firebaseId]
        );
        return row ? constructHymns([row])[0] : null;
    } catch (err) {
        console.error('Error fetching hymn by ID:', err);
        throw err;
    }
};

export const insertHymn = async (hymn) => {
    try {
        const {
            id: firebaseId, number, origin, doh, title,
            stanzas, refrains, category, updatedAt, audioUrl
        } = hymn;

        await database.runAsync(
            `INSERT OR REPLACE INTO hymns
         (firebase_id, hymn_number, origin, doh, title,
          stanzas, refrains, category, audio_url, updatedAt)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
            [
                firebaseId,
                number,
                origin,
                doh,
                title,
                JSON.stringify(stanzas),
                refrains ? JSON.stringify(refrains) : null,
                category,
                audioUrl ?? null,
                updatedAt ?? null
            ]
        );
    } catch (err) {
        console.error('Error inserting hymn:', err);
        throw err;
    }
};

export const updateHymnByFirebaseId = async (firebaseId, hymn) => {
    try {
        const {
            number, origin, doh, title,
            stanzas, refrains, category, updatedAt, audioUrl
        } = hymn;

        await database.runAsync(
            `UPDATE hymns
          SET hymn_number = ?, origin = ?, doh = ?, title = ?,
              stanzas = ?, refrains = ?, category = ?, audio_url = ?, updatedAt = ?
        WHERE firebase_id = ?`,
            [
                number,
                origin,
                doh,
                title,
                JSON.stringify(stanzas),
                refrains ? JSON.stringify(refrains) : null,
                category,
                audioUrl ?? null,
                updatedAt ?? null,
                firebaseId
            ]
        );
    } catch (err) {
        console.error('Error updating hymn:', err);
        throw err;
    }
};

/* ------------------------------------------------------------------ */
/*  SYNC & HELPERS                                                    */
/* ------------------------------------------------------------------ */

export const syncHymns = async (remoteHymns) => {
    try {
        await database.runAsync('BEGIN TRANSACTION');
        for (const hymn of remoteHymns) await insertHymn(hymn);
        await database.runAsync('COMMIT');
        return true;
    } catch (err) {
        await database.runAsync('ROLLBACK');
        console.error('Error syncing hymns:', err);
        throw err;
    }
};

export const getLastSyncTime = async () => {
    const row = await database.getFirstAsync(
        'SELECT MAX(updatedAt) AS lastSync FROM hymns WHERE updatedAt IS NOT NULL'
    );
    return row?.lastSync ?? null;
};

/* ------------------------------------------------------------------ */
/*  UTILITIES                                                         */
/* ------------------------------------------------------------------ */

const constructHymns = rows => rows.map(r => ({
    id:         r.id,
    firebaseId: r.firebase_id,
    number:     r.hymn_number,
    origin:     r.origin,
    doh:        r.doh,
    title:      r.title,
    stanzas:    r.stanzas   ? JSON.parse(r.stanzas)   : [],
    refrains:   r.refrains  ? JSON.parse(r.refrains)  : [],
    category:   r.category,
    audioUrl:   r.audio_url ?? null,
    updatedAt:  r.updatedAt
}));

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
