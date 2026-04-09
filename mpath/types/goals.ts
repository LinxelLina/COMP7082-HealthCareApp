
export type GoalFormType = {
    goal: string;
    description: string;
    category: string;
    newHabit: boolean;
    hasDuration: boolean;
    duration: Date;
    isComplete: boolean;
    isMilestone: boolean;
    milestoneType: string;
    milestoneTarget: number | null;
}

export type GoalFormValues = {
  goal: string;
  description: string;
  category: string;
  newHabit: boolean;
  hasDuration: boolean;
  duration: Date;
  isComplete: boolean;
  isMilestone: boolean;
  milestoneType: "" | "streak" | "count";
  milestoneTarget: number | null;
  reminderEnabled: boolean;
  reminderTime: Date;
};

export type GoalDetailParams = {
  goal_id?: string;
  title?: string;
  category?: string;
  description?: string;
  is_habit?: string;
  is_completed?: string;
  is_milestone?: string;
  milestone_type?: string;
  milestone_target?: string;
  duration_date?: string;
};

export type GoalFormProps = {
  onSubmit?: (form: GoalFormValues) => void;
};

export   type GoalsListProps = {
    showDropdownOverlay?: boolean;
    disableDropdown?: boolean;
    onRefresh?: (fn: () => void) => void;
  };

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
  check_in_count: number;
  duration_date: string | null;
  reminder_enabled: number;
  reminder_time: string | null;
  reminder_notification_id: string | null;
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
  check_in_count?: number;
  duration_date?: string | null;
  reminder_enabled?: boolean;
  reminder_time?: string | null;
  reminder_notification_id?: string | null;
};