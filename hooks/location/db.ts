import * as SQLite from "expo-sqlite";

const DB_NAME = "infogreen.db";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export type LocationRow = {
  latitude: number;
  longitude: number;
  time: string;
  accuracy: number | null;
};

const getDb = async () => {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS location_data (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          latitude REAL NOT NULL,
          longitude REAL NOT NULL,
          time TEXT NOT NULL,
          accuracy REAL,
          synced INTEGER NOT NULL DEFAULT 0
        );
      `);
      return db;
    })();
  }

  return dbPromise;
};

export const insertLocationData = async (row: LocationRow) => {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO location_data (latitude, longitude, time, accuracy, synced)
     VALUES (?, ?, ?, ?, 0)`,
    row.latitude,
    row.longitude,
    row.time,
    row.accuracy,
  );
};

export const getAllLocationData = async () => {
  const db = await getDb();
  return db.getAllAsync<{
    id: number;
    latitude: number;
    longitude: number;
    time: string;
    accuracy: number | null;
    synced: number;
  }>("SELECT * FROM location_data ORDER BY id ASC");
};
