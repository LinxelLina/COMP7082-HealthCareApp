import { GoalRecord } from "@/types/goals";
import { Habit } from "@/types/habit";

export const getRemainingTime = (endDate: string) => {
      const diff = new Date(endDate).getTime() - Date.now();

      if (diff <= 0) return "Expired";

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);

      return `${hours}h ${minutes}m`;
    };

export const mapGoalRecordToHabit = (goal: GoalRecord): Habit => ({
      id: goal.id != null ? goal.id.toString() : "",
      goal: goal.title,
      description: goal.description ?? "",
      category: goal.category ?? "Other",
      newHabit: !!goal.is_habit,
      isMilestone: !!goal.is_milestone,
      milestoneType: goal.milestone_type ?? "",
      milestoneTarget: goal.milestone_target ?? null,
      start_date: goal.created_at ? new Date(goal.created_at) : new Date(),
      hasDuration: goal.duration_date != null,
      duration: goal.duration_date ? new Date(goal.duration_date) : new Date(),
      isComplete: !!goal.is_completed,
    });