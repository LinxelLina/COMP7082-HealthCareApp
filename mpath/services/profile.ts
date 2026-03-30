import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";

const DB_NAME = "profile.db";

export type ProfileRecord = {
  current_charity: string | null;
  total_donations: number;
  disable_notifications: number;
  no_ads: number;
};

let db: SQLiteDatabase | null = null;

async function getDb() {
  if (!db) {
    db = await openDatabaseAsync(DB_NAME);
  }

  return db;
}

function toInt(value?: boolean) {
  return value ? 1 : 0;
}

async function ensureColumn(
  database: SQLiteDatabase,
  columnName: string,
  definition: string
) {
  const columns = await database.getAllAsync<{ name: string }>("PRAGMA table_info(profile)");
  const hasColumn = columns.some((column) => column.name === columnName);

  if (!hasColumn) {
    await database.execAsync(`ALTER TABLE profile ADD COLUMN ${columnName} ${definition};`);
  }
}

export async function initGoalsDatabase() {
  const database = await getDb();

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS profile (
      current_charity TEXT,
      total_donations REAL DEFAULT 0,
      disable_notifications INTEGER NOT NULL DEFAULT 0,
      no_ads INTEGER NOT NULL DEFAULT 0
    );
  `);

  await ensureColumn(database, "disable_notifications", "INTEGER NOT NULL DEFAULT 0");
  await ensureColumn(database, "no_ads", "INTEGER NOT NULL DEFAULT 0");

  await database.runAsync(`
    INSERT INTO profile (current_charity, total_donations)
    SELECT NULL, 0 WHERE NOT EXISTS (SELECT 1 FROM profile)
  `);
  return database;
}

export async function getProfile() {
  const database = await initGoalsDatabase();
  const rows = await database.getAllAsync<ProfileRecord>(
    "SELECT * FROM profile"
  );
  return rows[0] ?? null;
}

export async function getCharity(id: number) {
  const database = await initGoalsDatabase();
  const rows = await database.getAllAsync<ProfileRecord>("SELECT current_charity FROM profile");

  return rows[0] ?? null;
}

export async function updateCharity(id: number, charity: string) {
  const database = await initGoalsDatabase();
  await database.getAllAsync<ProfileRecord>(
    `UPDATE profile SET current_charity = ?`,
    charity
  );
}


export async function addDonation(amount: number) {
  const database = await initGoalsDatabase();
  await database.runAsync(
    `UPDATE profile SET total_donations = total_donations + ?`,
    amount
  );
}

export async function updateDisableNotifications(disableNotifications: boolean) {
  const database = await initGoalsDatabase();
  await database.runAsync(
    `UPDATE profile SET disable_notifications = ?`,
    toInt(disableNotifications)
  );
}

export async function updateNoAds(noAds: boolean) {
  const database = await initGoalsDatabase();
  await database.runAsync(
    `UPDATE profile SET no_ads = ?`,
    toInt(noAds)
  );
}
