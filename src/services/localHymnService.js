import database from '../utils/database';
import * as FileSystem from 'expo-file-system';

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
            youtube     TEXT,
            local_audio_path TEXT, -- Added for local audio storage
            updatedAt     TEXT,
            UNIQUE (hymn_number)
          );
        `);
            } else {
                /* ── 2.  Add missing columns when upgrading ───────────────── */
                const cols = await database.getAllAsync('PRAGMA table_info(hymns)');
                const hasCol = n => cols.some(c => c.name === n);

                if (!hasCol('firebase_id')) await database.runAsync(
                    "ALTER TABLE hymns ADD COLUMN firebase_id TEXT NOT NULL DEFAULT ''"
                );
                if (!hasCol('updatedAt')) await database.runAsync(
                    "ALTER TABLE hymns ADD COLUMN updatedAt TEXT"
                );
                if (!hasCol('audio_url')) await database.runAsync(
                    "ALTER TABLE hymns ADD COLUMN audio_url TEXT"
                );
                if (!hasCol('youtube')) await database.runAsync(
                    "ALTER TABLE hymns ADD COLUMN youtube TEXT"
                );
                if (!hasCol('local_audio_path')) await database.runAsync(
                    "ALTER TABLE hymns ADD COLUMN local_audio_path TEXT"
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
            stanzas, refrains, category, updatedAt, audioUrl, youtube, localAudioPath
        } = hymn;

        await database.runAsync(
            `INSERT OR REPLACE INTO hymns
            (firebase_id, hymn_number, origin, doh, title,
             stanzas, refrains, category, audio_url, youtube, local_audio_path, updatedAt)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
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
                youtube ?? null,        // Fixed: Now properly passing youtube
                localAudioPath ?? null, // Fixed: Now in correct position
                updatedAt ?? null       // Fixed: Now in correct position
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
            stanzas, refrains, category, updatedAt, audioUrl, youtube, localAudioPath
        } = hymn;

        await database.runAsync(
            `UPDATE hymns
             SET hymn_number = ?, origin = ?, doh = ?, title = ?,
                 stanzas = ?, refrains = ?, category = ?, audio_url = ?, youtube = ?, local_audio_path = ?, updatedAt = ?
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
                youtube ?? null,        // Fixed: Now properly passing youtube
                localAudioPath ?? null, // Fixed: Now in correct position
                updatedAt ?? null,      // Fixed: Now in correct position
                firebaseId              // Fixed: WHERE clause parameter
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
    id: r.id,
    firebaseId: r.firebase_id,
    number: r.hymn_number,
    origin: r.origin,
    doh: r.doh,
    title: r.title,
    stanzas: r.stanzas ? JSON.parse(r.stanzas) : [],
    refrains: r.refrains ? JSON.parse(r.refrains) : [],
    category: r.category,
    audioUrl: r.audio_url ?? null,
    youtube: r.youtube ?? null,
    localAudioPath: r.local_audio_path ?? null,
    updatedAt: r.updatedAt
}));

export const hasLocalHymns = async () => {
    try {
        const result = await database.getFirstAsync('SELECT COUNT(*) as count FROM hymns');
        return result.count > 0;
    } catch (error) {
        console.error("Error checking local hymns:", error);
        return false;
    }
};

export const getLocalHymnCount = async () => {
    try {
        const result = await database.getFirstAsync('SELECT COUNT(*) as count FROM hymns');
        return result.count || 0;
    } catch (error) {
        console.error("Error getting local hymn count:", error);
        return 0;
    }
};

export const getLocalTunesCount = async () => {
    try {
        const result = await database.getFirstAsync('SELECT COUNT(*) as count FROM hymns WHERE local_audio_path IS NOT NULL');
        return result.count || 0;
    } catch (error) {
        console.error("Error getting local tunes count:", error);
        return 0;
    }
};

export const clearAllHymns = async () => {
    try {
        // Delete local audio files
        const tunesDir = `${FileSystem.documentDirectory}tunes/`;
        await FileSystem.deleteAsync(tunesDir, { idempotent: true }).catch(() => {});
        // Clear database
        const result = await database.runAsync('DELETE FROM hymns');
        await database.runAsync('UPDATE hymns SET local_audio_path = NULL');
        console.log("All hymns and tunes cleared successfully");
        return {
            success: true,
            deletedCount: result.changes || 0
        };
    } catch (error) {
        console.error("Error clearing hymns:", error);
        throw error;
    }
};

/**
 * Download all tunes for hymns that have audio URLs
 */
export const downloadAllTunes = async (onProgress = null) => {
    try {
        // Get all hymns with audio URLs but no local audio path
        const hymnsWithAudio = await database.getAllAsync(
            'SELECT * FROM hymns WHERE audio_url IS NOT NULL AND local_audio_path IS NULL'
        );

        if (hymnsWithAudio.length === 0) {
            console.log('No tunes to download');
            return { success: true, downloaded: 0, total: 0 };
        }

        let downloaded = 0;
        const total = hymnsWithAudio.length;

        // Ensure tunes directory exists
        await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}tunes/`, {
            intermediates: true
        });

        for (let i = 0; i < hymnsWithAudio.length; i++) {
            const hymn = hymnsWithAudio[i];

            try {
                const fileName = `tune_${hymn.firebase_id}.mp3`;
                const localPath = `${FileSystem.documentDirectory}tunes/${fileName}`;

                // Download the tune
                const { uri } = await FileSystem.downloadAsync(hymn.audio_url, localPath);

                // Update database with local path
                await database.runAsync(
                    'UPDATE hymns SET local_audio_path = ? WHERE firebase_id = ?',
                    [uri, hymn.firebase_id]
                );

                downloaded++;

                // Report progress if callback provided
                if (onProgress) {
                    onProgress(downloaded, total, hymn.title);
                }

                console.log(`Downloaded tune ${downloaded}/${total}: ${hymn.title}`);
            } catch (error) {
                console.error(`Failed to download tune for hymn ${hymn.firebase_id}:`, error);
                // Continue with other downloads even if one fails
            }
        }

        return { success: true, downloaded, total, skipped: total - downloaded };
    } catch (error) {
        console.error('Error downloading all tunes:', error);
        throw error;
    }
};

/**
 * Update existing tunes - re-download if remote version is newer
 */
export const updateAllTunes = async (onProgress = null) => {
    try {
        // Get all hymns with audio URLs (including those already downloaded)
        const hymnsWithAudio = await database.getAllAsync(
            'SELECT * FROM hymns WHERE audio_url IS NOT NULL'
        );

        if (hymnsWithAudio.length === 0) {
            return { success: true, updated: 0, total: 0 };
        }

        let updated = 0;
        const total = hymnsWithAudio.length;

        for (let i = 0; i < hymnsWithAudio.length; i++) {
            const hymn = hymnsWithAudio[i];

            try {
                const fileName = `tune_${hymn.firebase_id}.mp3`;
                const localPath = `${FileSystem.documentDirectory}tunes/${fileName}`;

                // Download/re-download the tune
                const { uri } = await FileSystem.downloadAsync(hymn.audio_url, localPath);

                // Update database with local path
                await database.runAsync(
                    'UPDATE hymns SET local_audio_path = ? WHERE firebase_id = ?',
                    [uri, hymn.firebase_id]
                );

                updated++;

                if (onProgress) {
                    onProgress(updated, total, hymn.title);
                }

            } catch (error) {
                console.error(`Failed to update tune for hymn ${hymn.firebase_id}:`, error);
            }
        }

        return { success: true, updated, total };
    } catch (error) {
        console.error('Error updating all tunes:', error);
        throw error;
    }
};

/**
 * Clear all downloaded tunes
 */
export const clearAllTunes = async () => {
    try {
        // Delete the tunes directory
        const tunesDir = `${FileSystem.documentDirectory}tunes/`;
        await FileSystem.deleteAsync(tunesDir, { idempotent: true });

        // Update database to remove local paths
        const result = await database.runAsync(
            'UPDATE hymns SET local_audio_path = NULL WHERE local_audio_path IS NOT NULL'
        );

        console.log("All tunes cleared successfully");
        return {
            success: true,
            clearedCount: result.changes || 0
        };
    } catch (error) {
        console.error("Error clearing tunes:", error);
        throw error;
    }
};

/**
 * Get download progress info
 */
export const getTunesDownloadInfo = async () => {
    try {
        const totalWithAudio = await database.getFirstAsync(
            'SELECT COUNT(*) as count FROM hymns WHERE audio_url IS NOT NULL'
        );

        const downloaded = await database.getFirstAsync(
            'SELECT COUNT(*) as count FROM hymns WHERE local_audio_path IS NOT NULL'
        );

        return {
            total: totalWithAudio?.count || 0,
            downloaded: downloaded?.count || 0,
            remaining: (totalWithAudio?.count || 0) - (downloaded?.count || 0)
        };
    } catch (error) {
        console.error("Error getting tunes download info:", error);
        return { total: 0, downloaded: 0, remaining: 0 };
    }
};


/**
 * Batch update local paths to reduce database overhead
 */
const batchUpdateLocalPaths = async (updates) => {
    try {
        await database.withTransactionAsync(async () => {
            for (const update of updates) {
                await database.runAsync(
                    'UPDATE hymns SET local_audio_path = ? WHERE firebase_id = ?',
                    [update.localPath, update.firebaseId]
                );
            }
        });
    } catch (error) {
        console.error('Error batch updating local paths:', error);
        throw error;
    }
};
