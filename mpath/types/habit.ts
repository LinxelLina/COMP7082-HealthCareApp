export type Habit = {
      id: string;
      goal: string;
      description: string;
      category: string;
      newHabit: boolean;
      isMilestone: boolean;
      milestoneType: string;
      milestoneTarget: number | null;
      start_date: Date;
      hasDuration: boolean;
      duration: Date;
      isComplete: boolean;
    };

export type BasicHabit = {
  id: string;
  goal: string;
  category: string;
  isComplete: boolean;
};