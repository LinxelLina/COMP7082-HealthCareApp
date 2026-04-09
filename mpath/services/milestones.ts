import { MilestoneGoal } from "@/types/milestones";
import { listGoals } from "./goals";

export async function fetchMilestoneGoals(): Promise<MilestoneGoal[]> {
  const goals = await listGoals();
  return goals
    .filter((goal) => !!goal.is_milestone)
    .map((goal) => ({
      goal_id: String(goal.id),
      title: goal.title,
      milestone_type: goal.milestone_type,
      milestone_target: goal.milestone_target,
      check_in_count: goal.check_in_count ?? 0,
      duration_date: goal.duration_date,
      created_at: goal.created_at,
    }));
}

/* ---------- screen ---------- */
export function getDateProgress(goal: MilestoneGoal): number | null {
  if (!goal.duration_date) return null;

  const nowMs = Date.now();
  const targetMs = new Date(goal.duration_date).getTime();
  const startMs = goal.created_at ? new Date(goal.created_at).getTime() : NaN;

  if (Number.isNaN(targetMs)) return null;

  // Fallback when start date is missing/invalid.
  if (Number.isNaN(startMs) || targetMs <= startMs) {
    return nowMs >= targetMs ? 100 : 0;
  }

  const rawProgress = ((nowMs - startMs) / (targetMs - startMs)) * 100;
  return Math.max(0, Math.min(100, rawProgress));
}

export function getCheckInProgress(goal: MilestoneGoal): number | null {
  if (goal.milestone_type !== "count") return null;
  if (goal.milestone_target == null || goal.milestone_target <= 0) return null;

  const progress = (goal.check_in_count / goal.milestone_target) * 100;
  return Math.max(0, Math.min(100, progress));
}

export function getMilestoneProgress(goal: MilestoneGoal): number | null {
  if (goal.milestone_type === "count") {
    return getCheckInProgress(goal);
  }

  return getDateProgress(goal);
}

export function formatTargetDate(value: string): string {
  const targetDate = new Date(value);

  if (Number.isNaN(targetDate.getTime())) {
    return "No target date";
  }

  return targetDate.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getMilestoneSubtext(goal: MilestoneGoal): string | undefined {
  if (goal.milestone_type === "count") {
    if (goal.milestone_target != null) {
      return `${goal.check_in_count} of ${goal.milestone_target} check-ins`;
    }

    return "Check-in goal";
  }

  if (goal.duration_date) {
    return `Target date: ${formatTargetDate(goal.duration_date)}`;
  }

  if (goal.milestone_type === "streak") {
    return "Target date goal";
  }

  return undefined;
}

export function getRemainingHoursLabel(goal: MilestoneGoal): string | null {
  if (goal.milestone_type === "count") {
    if (goal.milestone_target == null) return null;
    return `${goal.check_in_count} of ${goal.milestone_target}`;
  }

  if (!goal.duration_date) return null;

  const targetMs = new Date(goal.duration_date).getTime();
  if (Number.isNaN(targetMs)) return null;

  const hoursLeft = Math.ceil((targetMs - Date.now()) / (1000 * 60 * 60));
  if (hoursLeft <= 0) return "overdue";
  return `${hoursLeft}h left`;
}

export function getProgressLabel(goal: MilestoneGoal): string {
  if (goal.milestone_type === "count") {
    return "Check-in progress";
  }

  return "Target date progress";
}

export function getProgressBarColor(progressPercent: number): string {
  if (progressPercent >= 100) return "#0f766e";
  if (progressPercent >= 70) return "#2e7d32";
  if (progressPercent >= 35) return "#ca8a04";
  return "#d97706";
}

export function getMilestoneValue(goal: MilestoneGoal): string {
  if (goal.milestone_type === "count") {
    if (goal.milestone_target != null) {
      return `${goal.milestone_target} check-ins`;
    }

    return "Check-ins";
  }

  return goal.duration_date ? "Target date" : "-";
}

export function getEmptyProgressText(goal: MilestoneGoal): string {
  if (goal.milestone_type === "count") {
    return "Add a check-in target to track progress.";
  }

  return "Add a target date to track progress.";
}

export function isCompletedMilestone(progressPercent: number | null): boolean {
  return progressPercent !== null && progressPercent >= 100;
}