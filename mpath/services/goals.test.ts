import { createGoal, updateGoalCompletion } from "./goals";

// Tests small goal database writes in the local goals service

const mockDatabase = {
  runAsync: jest.fn(),
  getAllAsync: jest.fn(),
};

jest.mock("expo-sqlite", () => ({
  openDatabaseAsync: jest.fn(() => Promise.resolve(mockDatabase)),
}));

jest.mock("@/utils/notifications", () => ({
  cancelScheduledReminder: jest.fn(),
}));

describe("createGoal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDatabase.getAllAsync.mockResolvedValue([
      { name: "reminder_enabled" },
      { name: "reminder_time" },
      { name: "reminder_notification_id" },
      { name: "check_in_count" },
    ]);
    mockDatabase.runAsync.mockResolvedValue({ lastInsertRowId: 12 });
  });

  it("trims the title before saving and returns the inserted id", async () => {
    const result = await createGoal({
      title: "  Drink Water  ",
      category: "Food",
    });
    // Sqlite is a db in a file doing some clever stuff so sometimes looks funky
    expect(result).toBe(12);
    expect(mockDatabase.runAsync).toHaveBeenLastCalledWith(
      expect.stringContaining("INSERT INTO goals"),
      "Drink Water",
      null,
      "Food",
      0,
      0,
      0,
      null,
      null,
      0,
      null,
      0,
      null,
      null
    );
  });
});

describe("updateGoalCompletion", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDatabase.getAllAsync.mockResolvedValue([
      { name: "reminder_enabled" },
      { name: "reminder_time" },
      { name: "reminder_notification_id" },
      { name: "check_in_count" },
    ]);
    mockDatabase.runAsync.mockResolvedValue(undefined);
  });

  it("stores completed goals as 1 in the local database", async () => {
    await updateGoalCompletion(5, true);

    expect(mockDatabase.runAsync).toHaveBeenLastCalledWith(
      "UPDATE goals SET is_completed = ? WHERE id = ?",
      1,
      5
    );
  });

  it("stores incomplete goals as 0 in the local database", async () => {
    await updateGoalCompletion(5, false);

    expect(mockDatabase.runAsync).toHaveBeenLastCalledWith(
      "UPDATE goals SET is_completed = ? WHERE id = ?",
      0,
      5
    );
  });
});
