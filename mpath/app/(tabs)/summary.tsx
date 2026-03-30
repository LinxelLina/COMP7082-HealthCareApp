import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  startOfWeekMonday,
  addWeeks,
  formatWeekRange,
} from "@/utils/week";
import { listGoals } from "@/services/goals";

/* ---------- UI helpers ---------- */
function Button({
  label,
  onPress,
  borderColor,
  textColor,
}: {
  label: string;
  onPress: () => void;
  borderColor: string;
  textColor: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        ...styles.button,
        borderWidth: 1,
        borderColor,
        backgroundColor: "#ffffff",
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text style={[styles.buttonText, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

function Section({
  title,
  children,
  borderColor,
  textColor,
}: {
  title: string;
  children: React.ReactNode;
  borderColor: string;
  textColor: string;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: textColor }]}>
        {title}
      </Text>
      <View
        style={{
          ...styles.sectionCard,
          overflow: "hidden",
          borderWidth: 1,
          borderColor,
          backgroundColor: "#ffffff",
        }}
      >
        {children}
      </View>
    </View>
  );
}

function Row({
  left,
  right,
  subLeft,
  isLast,
  borderColor,
  textColor,
  muted,
}: {
  left: string;
  right: string;
  subLeft?: string;
  isLast?: boolean;
  borderColor: string;
  textColor: string;
  muted: string;
}) {
  return (
    <View
      style={{
        ...styles.row,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: borderColor,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowTitle, { color: textColor }]}>
          {left}
        </Text>
        {subLeft && (
          <Text style={[styles.rowSubtext, { color: muted }]}>
            {subLeft}
          </Text>
        )}
      </View>

      <Text style={[styles.rowValue, { color: textColor }]}>
        {right}
      </Text>
    </View>
  );
}

/* ---------- screen ---------- */
type MilestoneGoal = {
  goal_id: string;
  title: string;
  milestone_type: string | null;
  milestone_target: number | null;
  check_in_count: number;
  duration_date: string | null;
  created_at: string | null;
};

function getDateProgress(goal: MilestoneGoal): number | null {
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

function getCheckInProgress(goal: MilestoneGoal): number | null {
  if (goal.milestone_type !== "count") return null;
  if (goal.milestone_target == null || goal.milestone_target <= 0) return null;

  const progress = (goal.check_in_count / goal.milestone_target) * 100;
  return Math.max(0, Math.min(100, progress));
}

function getMilestoneProgress(goal: MilestoneGoal): number | null {
  if (goal.milestone_type === "count") {
    return getCheckInProgress(goal);
  }

  return getDateProgress(goal);
}

function formatTargetDate(value: string): string {
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

function getMilestoneSubtext(goal: MilestoneGoal): string | undefined {
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

function getRemainingHoursLabel(goal: MilestoneGoal): string | null {
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

function getProgressLabel(goal: MilestoneGoal): string {
  if (goal.milestone_type === "count") {
    return "Check-in progress";
  }

  return "Target date progress";
}

function getProgressBarColor(progressPercent: number): string {
  if (progressPercent >= 100) return "#0f766e";
  if (progressPercent >= 70) return "#2e7d32";
  if (progressPercent >= 35) return "#ca8a04";
  return "#d97706";
}

function getMilestoneValue(goal: MilestoneGoal): string {
  if (goal.milestone_type === "count") {
    if (goal.milestone_target != null) {
      return `${goal.milestone_target} check-ins`;
    }

    return "Check-ins";
  }

  return goal.duration_date ? "Target date" : "-";
}

function getEmptyProgressText(goal: MilestoneGoal): string {
  if (goal.milestone_type === "count") {
    return "Add a check-in target to track progress.";
  }

  return "Add a target date to track progress.";
}

export default function SummaryScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];

  const textColor = theme.text;
  const muted = `${theme.text}AA`;
  const border = theme.icon;
  const background = "#f4f6f8";
  const accent = "#2e7d32";

  const [anchor, setAnchor] = useState(new Date());
  const weekStart = useMemo(() => startOfWeekMonday(anchor), [anchor]);
  const [milestones, setMilestones] = useState<MilestoneGoal[]>([]);

  const fetchMilestones = async () => {
    try {
      const goals = await listGoals();
      const localMilestones = goals
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

      setMilestones(localMilestones);
    } catch (error) {
      console.error("Error fetching milestones:", error);
      setMilestones([]);
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchMilestones();
    }, [])
  );

  return (
    <ScrollView
      style={{ backgroundColor: background }}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 24,
      }}
    >
      <View style={styles.header}>
        <Text style={[styles.pageTitle, { color: textColor }]}>
          Weekly Summary
        </Text>
        <Text style={[styles.pageSubtitle, { color: muted }]}>
          {formatWeekRange(weekStart)} (Mon-Sun)
        </Text>
      </View>

      <View style={styles.controlsCard}>
        <View style={styles.buttonRow}>
          <Button label="← Prev" onPress={() => setAnchor(addWeeks(anchor, -1))} borderColor={border} textColor={textColor} />
          <Button label="This Week" onPress={() => setAnchor(new Date())} borderColor={accent} textColor={accent} />
          <Button label="Next →" onPress={() => setAnchor(addWeeks(anchor, 1))} borderColor={border} textColor={textColor} />
        </View>
      </View>

      <Section title="Milestones" borderColor={border} textColor={textColor}>
        {milestones.length === 0 ? (
          <Row
            left="No milestone goals yet"
            right=""
            isLast
            borderColor={border}
            textColor={textColor}
            muted={muted}
          />
        ) : (
          milestones.map((m, i) => {
            const progressPercent = getMilestoneProgress(m);
            const subLeft = getMilestoneSubtext(m);
            const remainingHoursLabel = getRemainingHoursLabel(m);
            const progressBarColor = progressPercent !== null ? getProgressBarColor(progressPercent) : accent;

            return (
              <View key={m.goal_id}>
                <Row
                  left={m.title}
                  right={getMilestoneValue(m)}
                  subLeft={subLeft}
                  isLast={false}
                  borderColor={border}
                  textColor={textColor}
                  muted={muted}
                />
                {progressPercent !== null ? (
                  <View>
                    <Text style={[styles.progressLabel, { color: muted }]}>
                      {getProgressLabel(m)}
                    </Text>
                    <View style={[styles.progressRow, { marginBottom: i === milestones.length - 1 ? 12 : 8 }]}>
                      <View
                        style={{
                          ...styles.progressTrack,
                          backgroundColor: `${border}33`,
                        }}
                      >
                        <View
                          style={{
                            ...styles.progressFill,
                            width: `${progressPercent}%`,
                            backgroundColor: progressBarColor,
                          }}
                        />
                      </View>
                      {remainingHoursLabel && (
                        <Text style={[styles.remainingText, { color: muted }]}>
                          {remainingHoursLabel}
                        </Text>
                      )}
                    </View>
                  </View>
                ) : (
                  <Text style={[styles.noTargetText, { color: muted, marginBottom: i === milestones.length - 1 ? 12 : 8 }]}>
                    {getEmptyProgressText(m)}
                  </Text>
                )}
              </View>
            );
          })
        )}
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 12,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  controlsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dfe6e9",
    padding: 12,
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  buttonText: {
    fontWeight: "700",
  },
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  sectionCard: {
    borderRadius: 16,
  },
  row: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  rowSubtext: {
    marginTop: 2,
    fontSize: 13,
  },
  rowValue: {
    fontSize: 16,
    fontWeight: "800",
  },
  progressLabel: {
    marginHorizontal: 14,
    marginBottom: 4,
    fontSize: 13,
  },
  progressRow: {
    marginHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
    flex: 1,
  },
  progressFill: {
    height: 8,
  },
  remainingText: {
    fontSize: 12,
    fontWeight: "600",
  },
  noTargetText: {
    marginHorizontal: 14,
    fontSize: 13,
  },
});
