import { GoalRecord } from "@/types/goals";

import { mapGoalRecordToHabit } from "./goals";

// Tests that goal records are converted into the habit format used by the app

describe("mapGoalRecordToHabit", () => {
  it("converts a goal record into a habit used by the app", () => {
    const goal: GoalRecord = {
      id: 7,
      title: "Drink Water",
      description: "Stay hydrated",
      category: "Food",
      is_habit: 1,
      is_completed: 0,
      is_milestone: 1,
      milestone_type: "count",
      milestone_target: 20,
      check_in_count: 5,
      duration_date: "2026-05-01T10:30:00.000Z",
      reminder_enabled: 1,
      reminder_time: "09:30",
      reminder_notification_id: "notif-123",
      created_at: "2026-04-01T08:00:00.000Z",
    };

    const result = mapGoalRecordToHabit(goal);

    expect(result).toEqual({
      id: "7",
      goal: "Drink Water",
      description: "Stay hydrated",
      category: "Food",
      newHabit: true,
      isMilestone: true,
      milestoneType: "count",
      milestoneTarget: 20,
      start_date: new Date("2026-04-01T08:00:00.000Z"),
      hasDuration: true,
      duration: new Date("2026-05-01T10:30:00.000Z"),
      isComplete: false,
    });
  });

  it("uses fallback values when optional fields are missing", () => {
    const goal: GoalRecord = {
      id: 3,
      title: "Read more",
      description: null,
      category: null,
      is_habit: 0,
      is_completed: 1,
      is_milestone: 0,
      milestone_type: null,
      milestone_target: null,
      check_in_count: 0,
      duration_date: null,
      reminder_enabled: 0,
      reminder_time: null,
      reminder_notification_id: null,
      created_at: "2026-04-02T09:15:00.000Z",
    };

    const result = mapGoalRecordToHabit(goal);

    expect(result.description).toBe("");
    expect(result.category).toBe("Other");
    expect(result.milestoneType).toBe("");
    expect(result.milestoneTarget).toBeNull();
    expect(result.id).toBe("3");
  });

  it("converts db flags into booleans and handles goals without duration", () => {
    const goal: GoalRecord = {
      id: 11,
      title: "Stretch",
      description: null,
      category: "Fitness",
      is_habit: 0,
      is_completed: 1,
      is_milestone: 0,
      milestone_type: null,
      milestone_target: null,
      check_in_count: 0,
      duration_date: null,
      reminder_enabled: 0,
      reminder_time: null,
      reminder_notification_id: null,
      created_at: "2026-04-03T12:00:00.000Z",
    };

    const result = mapGoalRecordToHabit(goal);

    expect(result.newHabit).toBe(false);
    expect(result.isMilestone).toBe(false);
    expect(result.isComplete).toBe(true);
    expect(result.hasDuration).toBe(false);
    expect(result.start_date).toBeInstanceOf(Date);
    expect(result.duration).toBeInstanceOf(Date);
  });
});
