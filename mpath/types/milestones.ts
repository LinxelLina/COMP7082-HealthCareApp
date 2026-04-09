export type MilestoneGoal = {
  goal_id: string;
  title: string;
  milestone_type: string | null;
  milestone_target: number | null;
  check_in_count: number;
  duration_date: string | null;
  created_at: string | null;
};