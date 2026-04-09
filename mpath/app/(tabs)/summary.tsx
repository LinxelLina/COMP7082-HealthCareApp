import React, {useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from "react-native";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  startOfWeekMonday,
  addWeeks,
  formatWeekRange,
} from "@/utils/week";
import {MilestoneGoal} from "@/types/milestones"
import { getMilestoneProgress, getMilestoneSubtext, getRemainingHoursLabel, getProgressBarColor, isCompletedMilestone, getMilestoneValue, getProgressLabel, getEmptyProgressText, fetchMilestoneGoals,  } from "@/services/milestones";

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
      const milestoneGoals = await fetchMilestoneGoals();
      setMilestones(milestoneGoals);
    } catch (error) {
      console.error("Error fetching milestones:", error);
      setMilestones([]);
      Alert.alert("Error", "Could not load milestones. Please try again.");
    }
  };

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
            const isLast = i === milestones.length - 1;
            const subLeft = getMilestoneSubtext(m);
            const remainingHoursLabel = getRemainingHoursLabel(m);
            const progressBarColor = progressPercent !== null ? getProgressBarColor(progressPercent) : accent;
            const isCompleted = isCompletedMilestone(progressPercent);
            const progressBlockMargin = i === milestones.length - 1 ? 12 : 8;

            return (
              <View key={m.goal_id}
                style={{        
                  borderBottomWidth: isLast ? 0 : 1,
                  borderBottomColor: border,}}>
                <Row
                  left={m.title}
                  right={getMilestoneValue(m)}
                  subLeft={subLeft}
                  isLast={true}
                  borderColor={border}
                  textColor={textColor}
                  muted={muted}
                />
                {progressPercent !== null ? (
                  <View
                    style={[
                      styles.progressBlock,
                      isCompleted && styles.completedBlock,
                      { marginBottom: progressBlockMargin },
                    ]}
                  >
                    <View style={styles.progressHeader}>
                      {!isCompleted && (
                        <Text style={[styles.progressLabel, { color: muted }]}>
                          {getProgressLabel(m)}
                        </Text>
                      )}
                      {isCompleted && (
                        <View style={styles.completedBadge}>
                          <Text style={styles.completedBadgeText}>✓ Completed</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.progressRow}>
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
                      {!isCompleted && remainingHoursLabel && (
                        <Text style={[styles.remainingText, { color: muted }]}>
                          {remainingHoursLabel}
                        </Text>
                      )}
                    </View>
                    {isCompleted && (
                      <Text style={styles.completedSupportText}>
                        Nice work staying consistent.
                      </Text>
                    )}
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
  progressBlock: {
    marginBottom: 8,
  },
  completedBlock: {
    marginHorizontal: 10,
    marginTop: 2,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#ecfdf3",
  },
  progressHeader: {
    marginHorizontal: 14,
    marginBottom: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: {
    fontSize: 13,
  },
  completedBadge: {
    backgroundColor: "#d1fae5",
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  completedBadgeText: {
    color: "#166534",
    fontSize: 12,
    fontWeight: "700",
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
  completedSupportText: {
    marginTop: 5,
    marginHorizontal: 14,
    color: "#166534",
    fontSize: 12,
    fontWeight: "600",
  },
  noTargetText: {
    marginHorizontal: 14,
    fontSize: 13,
  },
});
