import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
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
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text style={{ fontWeight: "700", color: textColor }}>{label}</Text>
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
    <View style={{ marginTop: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 8, color: textColor }}>
        {title}
      </Text>
      <View
        style={{
          borderRadius: 14,
          overflow: "hidden",
          borderWidth: 1,
          borderColor,
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
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: borderColor,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: "600", color: textColor }}>
          {left}
        </Text>
        {subLeft && (
          <Text style={{ marginTop: 2, fontSize: 13, color: muted }}>
            {subLeft}
          </Text>
        )}
      </View>

      <Text style={{ fontSize: 16, fontWeight: "800", color: textColor }}>
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
  duration_date: string | null;
  created_at: string | null;
};

function getMilestoneProgress(goal: MilestoneGoal): number | null {
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

function getMilestoneSubtext(goal: MilestoneGoal, progressPercent: number | null): string | undefined {
  if (goal.milestone_type && progressPercent !== null) {
    return `Type: ${goal.milestone_type} • ${Math.round(progressPercent)}%`;
  }
  if (goal.milestone_type) {
    return `Type: ${goal.milestone_type}`;
  }
  if (progressPercent !== null) {
    return `${Math.round(progressPercent)}%`;
  }
  return undefined;
}

function getRemainingHoursLabel(goal: MilestoneGoal): string | null {
  if (!goal.duration_date) return null;

  const targetMs = new Date(goal.duration_date).getTime();
  if (Number.isNaN(targetMs)) return null;

  const hoursLeft = Math.ceil((targetMs - Date.now()) / (1000 * 60 * 60));
  if (hoursLeft <= 0) return "overdue";
  return `${hoursLeft}h left`;
}

export default function SummaryScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];

  const textColor = theme.text;
  const muted = `${theme.text}AA`;
  const border = theme.icon;
  const background = theme.background;

  const [anchor, setAnchor] = useState(new Date());
  const weekStart = useMemo(() => startOfWeekMonday(anchor), [anchor]);
  const [milestones, setMilestones] = useState<MilestoneGoal[]>([]);

  useEffect(() => {
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
            duration_date: goal.duration_date,
            created_at: goal.created_at,
          }));

        setMilestones(localMilestones);
      } catch (error) {
        console.error("Error fetching milestones:", error);
        setMilestones([]);
      }
    };

    fetchMilestones();
  }, []);

  return (
    <ScrollView style={{ backgroundColor: background }}     contentContainerStyle={{
      paddingHorizontal: 16,
      paddingTop: insets.top + 16,
      paddingBottom: insets.bottom + 24,
    }}
    >
      <Text style={{ fontSize: 26, fontWeight: "900", color: textColor }}>
        Weekly Summary
      </Text>

      <Text style={{ marginTop: 6, fontSize: 14, color: muted }}>
        {formatWeekRange(weekStart)} (Mon–Sun)
      </Text>

      <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
        <Button label="← Prev" onPress={() => setAnchor(addWeeks(anchor, -1))} borderColor={border} textColor={textColor} />
        <Button label="This Week" onPress={() => setAnchor(new Date())} borderColor={border} textColor={textColor} />
        <Button label="Next →" onPress={() => setAnchor(addWeeks(anchor, 1))} borderColor={border} textColor={textColor} />
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
            const subLeft = getMilestoneSubtext(m, progressPercent);
            const remainingHoursLabel = getRemainingHoursLabel(m);

            return (
              <View key={m.goal_id}>
                <Row
                  left={m.title}
                  right={m.milestone_target != null ? `${m.milestone_target}` : "-"}
                  subLeft={subLeft}
                  isLast={false}
                  borderColor={border}
                  textColor={textColor}
                  muted={muted}
                />
                {progressPercent !== null ? (
                  <View>
                    <Text style={{ marginHorizontal: 14, marginBottom: 4, fontSize: 13, color: muted }}>
                      Progress: {m.title}
                    </Text>
                    <View style={{ marginHorizontal: 14, marginBottom: i === milestones.length - 1 ? 12 : 8, flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <View
                        style={{
                          height: 8,
                          backgroundColor: `${border}33`,
                          borderRadius: 999,
                          overflow: "hidden",
                          flex: 1,
                        }}
                      >
                        <View
                          style={{
                            height: 8,
                            width: `${progressPercent}%`,
                            backgroundColor: textColor,
                          }}
                        />
                      </View>
                      {remainingHoursLabel && (
                        <Text style={{ fontSize: 12, color: muted, fontWeight: "600" }}>
                          {remainingHoursLabel}
                        </Text>
                      )}
                    </View>
                  </View>
                ) : (
                  <Text style={{ marginHorizontal: 14, marginBottom: i === milestones.length - 1 ? 12 : 8, fontSize: 13, color: muted }}>
                    No target date
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
