import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";

const DB_NAME = "profile.db";

export type ProfileRecord = {
  current_charity: string | null;
  total_donations: number;
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

export async function initGoalsDatabase() {
  const database = await getDb();

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS profile (
      current_charity TEXT,
      total_donations REAL DEFAULT 0
    );
  `);

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
  const rows = await database.getAllAsync<ProfileRecord>(
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
