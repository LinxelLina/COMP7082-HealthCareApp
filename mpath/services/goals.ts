import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";

const GOALS_DATABASE_NAME = "goals.db";

export type GoalRecord = {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  is_habit: number;
  is_completed: number;
  is_milestone: number;
  milestone_type: string | null;
  milestone_target: number | null;
  duration_date: string | null;
  created_at: string;
};

export type CreateGoalInput = {
  title: string;
  description?: string | null;
  category?: string | null;
  is_habit?: boolean;
  is_completed?: boolean;
  is_milestone?: boolean;
  milestone_type?: string | null;
  milestone_target?: number | null;
  duration_date?: string | null;
};

export type UpdateMilestoneInput = {
  is_milestone: boolean;
  milestone_type?: string | null;
  milestone_target?: number | null;
  duration_date?: string | null;
};

let dbPromise: Promise<SQLiteDatabase> | null = null;

async function getGoalsDatabase() {
  if (!dbPromise) {
    dbPromise = openDatabaseAsync(GOALS_DATABASE_NAME);
  }

  return dbPromise;
}

export async function initGoalsDatabase() {
  const db = await getGoalsDatabase();

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT,
      is_habit INTEGER NOT NULL DEFAULT 0,
      is_completed INTEGER NOT NULL DEFAULT 0,
      is_milestone INTEGER NOT NULL DEFAULT 0,
      milestone_type TEXT,
      milestone_target INTEGER,
      duration_date TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return db;
}

export async function listGoals() {
  const db = await initGoalsDatabase();
  return db.getAllAsync<GoalRecord>(
    `SELECT * FROM goals ORDER BY datetime(created_at) DESC, id DESC`
  );
}

export async function getGoalById(id: number) {
  const db = await initGoalsDatabase();
  const rows = await db.getAllAsync<GoalRecord>(
    `SELECT * FROM goals WHERE id = ? LIMIT 1`,
    id
  );

  return rows[0] ?? null;
}

export async function createGoal(input: CreateGoalInput) {
  const db = await initGoalsDatabase();
  const result = await db.runAsync(
    `INSERT INTO goals (
      title,
      description,
      category,
      is_habit,
      is_completed,
      is_milestone,
      milestone_type,
      milestone_target,
      duration_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    input.title.trim(),
    input.description ?? null,
    input.category ?? null,
    input.is_habit ? 1 : 0,
    input.is_completed ? 1 : 0,
    input.is_milestone ? 1 : 0,
    input.milestone_type ?? null,
    input.milestone_target ?? null,
    input.duration_date ?? null
  );

  return result.lastInsertRowId;
}

export async function updateGoalCompletion(id: number, isCompleted: boolean) {
  const db = await initGoalsDatabase();
  await db.runAsync(
    `UPDATE goals SET is_completed = ? WHERE id = ?`,
    isCompleted ? 1 : 0,
    id
  );
}

export async function updateGoalMilestone(id: number, input: UpdateMilestoneInput) {
  const db = await initGoalsDatabase();
  await db.runAsync(
    `UPDATE goals
      SET is_milestone = ?,
          milestone_type = ?,
          milestone_target = ?,
          duration_date = ?
      WHERE id = ?`,
    input.is_milestone ? 1 : 0,
    input.milestone_type ?? null,
    input.milestone_target ?? null,
    input.duration_date ?? null,
    id
  );
}

export async function deleteGoal(id: number) {
  const db = await initGoalsDatabase();
  await db.runAsync(`DELETE FROM goals WHERE id = ?`, id);
}
