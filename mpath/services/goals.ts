// Data layer to take care of sqlite

import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";
import { cancelScheduledReminder } from "@/utils/notifications";
import { GoalRecord, CreateGoalInput } from "@/types/goals";
import { getRemainingTime, mapGoalRecordToHabit } from "@/utils/goals";
import { Habit } from "@/types/habit";
const DB_NAME = "goals.db";

export type UpdateMilestoneInput = {
  is_milestone: boolean;
  milestone_type?: string | null;
  milestone_target?: number | null;
  duration_date?: string | null;
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
  const columns = await database.getAllAsync<{ name: string }>("PRAGMA table_info(goals)");
  const hasColumn = columns.some((column) => column.name === columnName);

  if (!hasColumn) {
    try {
      await database.runAsync(`ALTER TABLE goals ADD COLUMN ${columnName} ${definition}`);
    } catch (error: any) {
      // If two startup calls try the same migration at once, the second one can safely ignore this.
      if (!String(error?.message ?? error).includes("duplicate column name")) {
        throw error;
      }
    }
  }
}

export async function initGoalsDatabase() {
  try {
    const database = await getDb();

    await database.runAsync(`
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
        check_in_count INTEGER NOT NULL DEFAULT 0,
        duration_date TEXT,
        reminder_enabled INTEGER NOT NULL DEFAULT 0,
        reminder_time TEXT,
        reminder_notification_id TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await ensureColumn(database, "reminder_enabled", "INTEGER NOT NULL DEFAULT 0");
    await ensureColumn(database, "reminder_time", "TEXT");
    await ensureColumn(database, "reminder_notification_id", "TEXT");
    await ensureColumn(database, "check_in_count", "INTEGER NOT NULL DEFAULT 0");

    return database;
  } catch (error) {
    console.error("services/goals.initGoalsDatabase failed:", error);
    throw error;
  }
}

export async function listGoals() {
  try {
    const database = await initGoalsDatabase();
    const rows = await database.getAllAsync<GoalRecord>(
      "SELECT * FROM goals ORDER BY datetime(created_at) DESC, id DESC"
    );
    return rows;
  } catch (error) {
    console.error("services/goals.listGoals failed:", error);
    throw error;
  }
}

export async function getGoalById(id: number) {
  try {
    const database = await initGoalsDatabase();
    const rows = await database.getAllAsync<GoalRecord>("SELECT * FROM goals WHERE id = ? LIMIT 1", id);

    return rows[0] ?? null;
  } catch (error) {
    console.error(`services/goals.getGoalById failed for id ${id}:`, error);
    throw error;
  }
}

export async function createGoal(input: CreateGoalInput) {
  try {
    const database = await initGoalsDatabase();
    const result = await database.runAsync(
      `INSERT INTO goals (
        title,
        description,
        category,
        is_habit,
        is_completed,
        is_milestone,
        milestone_type,
        milestone_target,
        check_in_count,
        duration_date,
        reminder_enabled,
        reminder_time,
        reminder_notification_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      input.title.trim(),
      input.description ?? null,
      input.category ?? null,
      toInt(input.is_habit),
      toInt(input.is_completed),
      toInt(input.is_milestone),
      input.milestone_type ?? null,
      input.milestone_target ?? null,
      input.check_in_count ?? 0,
      input.duration_date ?? null,
      toInt(input.reminder_enabled),
      input.reminder_time ?? null,
      input.reminder_notification_id ?? null
    );

    return result.lastInsertRowId;
  } catch (error) {
    console.error("services/goals.createGoal failed:", error);
    throw error;
  }
}

export async function updateGoalReminder(id: number, reminderNotificationId: string | null) {
  try {
    const database = await initGoalsDatabase();
    await database.runAsync(
      `UPDATE goals
        SET reminder_notification_id = ?
        WHERE id = ?`,
      reminderNotificationId,
      id
    );
  } catch (error) {
    console.error(`services/goals.updateGoalReminder failed for id ${id}:`, error);
    throw error;
  }
}

export async function updateGoalCompletion(id: number, isCompleted: boolean) {
  try {
    const database = await initGoalsDatabase();
    await database.runAsync(
      `UPDATE goals SET is_completed = ? WHERE id = ?`,
      toInt(isCompleted),
      id
    );
  } catch (error) {
    console.error(`services/goals.updateGoalCompletion failed for id ${id}:`, error);
    throw error;
  }
}

export async function updateGoalMilestone(id: number, input: UpdateMilestoneInput) {
  try {
    const database = await initGoalsDatabase();
    await database.runAsync(
      `UPDATE goals
        SET is_milestone = ?,
            milestone_type = ?,
            milestone_target = ?,
            duration_date = ?
        WHERE id = ?`,
      toInt(input.is_milestone),
      input.milestone_type ?? null,
      input.milestone_target ?? null,
      input.duration_date ?? null,
      id
    );
  } catch (error) {
    console.error(`services/goals.updateGoalMilestone failed for id ${id}:`, error);
    throw error;
  }
}

export async function incrementGoalCheckInCount(id: number) {
  try {
    const database = await initGoalsDatabase();
    const rows = await database.getAllAsync<{
      check_in_count: number | null;
      milestone_type: string | null;
      milestone_target: number | null;
    }>(
      `SELECT check_in_count, milestone_type, milestone_target
        FROM goals
        WHERE id = ? LIMIT 1`,
      id
    );

    const goal = rows[0];

    if (!goal) {
      return;
    }

    const currentCheckInCount =
      typeof goal.check_in_count === "number" && Number.isFinite(goal.check_in_count)
        ? goal.check_in_count
        : 0;

    let nextCheckInCount = currentCheckInCount + 1;

    if (
      goal.milestone_type === "count" &&
      typeof goal.milestone_target === "number" &&
      Number.isFinite(goal.milestone_target)
    ) {
      nextCheckInCount = Math.min(nextCheckInCount, goal.milestone_target);
    }

    await database.runAsync(
      `UPDATE goals SET check_in_count = ? WHERE id = ?`,
      nextCheckInCount,
      id
    );
  } catch (error) {
    console.error(`services/goals.incrementGoalCheckInCount failed for id ${id}:`, error);
    throw error;
  }
}

export async function setGoalCheckInCountToMilestoneTarget(id: number) {
  try {
    const database = await initGoalsDatabase();
    const rows = await database.getAllAsync<{
      milestone_type: string | null;
      milestone_target: number | null;
    }>(
      `SELECT milestone_type, milestone_target
        FROM goals
        WHERE id = ? LIMIT 1`,
      id
    );

    const goal = rows[0];

    if (
      !goal ||
      goal.milestone_type !== "count" ||
      typeof goal.milestone_target !== "number" ||
      !Number.isFinite(goal.milestone_target)
    ) {
      return null;
    }

    await database.runAsync(
      `UPDATE goals SET check_in_count = ? WHERE id = ?`,
      goal.milestone_target,
      id
    );

    return goal.milestone_target;
  } catch (error) {
    console.error(`services/goals.setGoalCheckInCountToMilestoneTarget failed for id ${id}:`, error);
    throw error;
  }
}

export async function deleteGoal(id: number) {
  try {
    const database = await initGoalsDatabase();
    const rows = await database.getAllAsync<{ reminder_notification_id: string | null }>(
      "SELECT reminder_notification_id FROM goals WHERE id = ? LIMIT 1",
      id
    );
    const reminderNotificationId = rows[0]?.reminder_notification_id;

    if (reminderNotificationId) {
      try {
        await cancelScheduledReminder(reminderNotificationId);
      } catch (error) {
        console.error(`services/goals.deleteGoal failed to cancel reminder for id ${id}:`, error);
      }
    }

    await database.runAsync("DELETE FROM goals WHERE id = ?", id);
  } catch (error) {
    console.error(`services/goals.deleteGoal failed for id ${id}:`, error);
    throw error;
  }
}

export const fetchAndCleanGoals = async (): Promise<Habit []> => {
    const data = await listGoals();
    const mappedData = data.map(mapGoalRecordToHabit);
    //delete goals that have expired and are marked as complete, append remaining time to goals that have expired but are not marked as complete, and append remaining time to goals that have a duration
    
    for (const goal of mappedData || []) {
      if (goal.hasDuration) {
        const remainingTime = getRemainingTime(goal.duration.toISOString());
        if(remainingTime === "Expired" && goal.isComplete) {
          try{
            const id = Number(goal.id);
            if(isNaN(id)) continue;
            await deleteGoal(id);
          } catch{
            console.error(`Failed to delete expired goal ${goal.id}`);
          }
        }else if (remainingTime === "Expired" && !goal.isComplete) {
          goal.goal += " (Expired)";
        }else {
          goal.goal += ` (${remainingTime} remaining)`;
        }
      }
    }
      // delete goals a day old that don't have durations
    const oneDay = 24 * 60 * 60 * 1000;
    for (const goal of mappedData || []) {
      if (!goal.hasDuration && goal.isComplete) {
        const createdAt = new Date(goal.start_date);
        if (Date.now() - createdAt.getTime() > oneDay){
          try{
            const id = Number(goal.id);
            if(isNaN(id)) continue;
            await deleteGoal(id);
          }catch(error){
            console.error(`Failed to delete old goal ${goal.id}`);
          }
        }
      }  
    }

  return mappedData;
}
