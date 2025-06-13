import * as SQLite from 'expo-sqlite';

const database = SQLite.openDatabaseSync('hymns.db');
export default database;
