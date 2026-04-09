jest.mock("./goals", () => ({
  listGoals: jest.fn(),
}));

import { getCheckInProgress } from "./milestones";

// Tests check-in milestone progress

describe("getCheckInProgress", () => {
  it("caps progress at 100 when check-ins go past the target", () => {
    const result = getCheckInProgress({
      goal_id: "1",
      title: "Drink Water",
      milestone_type: "count",
      milestone_target: 4,
      check_in_count: 6,
      duration_date: null,
      created_at: "2026-04-01T08:00:00.000Z",
    });

    expect(result).toBe(100);
  });

  it("returns null when a check-in milestone has no target", () => {
    const result = getCheckInProgress({
      goal_id: "2",
      title: "Read More",
      milestone_type: "count",
      milestone_target: null,
      check_in_count: 3,
      duration_date: null,
      created_at: "2026-04-01T08:00:00.000Z",
    });

    expect(result).toBeNull();
  });

  it("returns null when the milestone is not a check-in milestone", () => {
    const result = getCheckInProgress({
      goal_id: "3",
      title: "Sleep Earlier",
      milestone_type: "streak",
      milestone_target: 7,
      check_in_count: 3,
      duration_date: "2026-04-10T08:00:00.000Z",
      created_at: "2026-04-01T08:00:00.000Z",
    });

    expect(result).toBeNull();
  });

  it("returns the expected percentage for a valid check-in milestone", () => {
    const result = getCheckInProgress({
      goal_id: "4",
      title: "Walk Daily",
      milestone_type: "count",
      milestone_target: 8,
      check_in_count: 4,
      duration_date: null,
      created_at: "2026-04-01T08:00:00.000Z",
    });

    expect(result).toBe(50);
  });
});
