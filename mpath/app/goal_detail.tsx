import {
  getGoalById,
  incrementGoalCheckInCount,
  setGoalCheckInCountToMilestoneTarget,
  updateGoalMilestone,
} from "@/services/goals";
import { sendLocalNotificationNow } from "@/utils/notifications";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { Checkbox } from "expo-checkbox";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

const HYDRATION_DEMO_GOAL_TITLE = "drink water daily";
const HYDRATION_DEMO_NOTIFICATION_TITLE = "Hydration milestone complete";
const HYDRATION_DEMO_NOTIFICATION_BODY =
  "Your memory, cognitive performance, and energy levels can be measurably improved because you’re staying hydrated.";

function normalizeGoalTitle(value: string | string[] | undefined) {
  const title = Array.isArray(value) ? value[0] : value;

  if (!title) {
    return "";
  }

  return title.trim().replace(/\s+/g, " ").toLowerCase();
}

export default function GoalDetailScreen() {
  const params = useLocalSearchParams<{
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
  }>();

  const hasDescription = !!params.description?.trim();
  const hasSavedDuration = !!params.duration_date?.trim();
  const isHabitGoal = params.is_habit === "true";
  const isCompleted = params.is_completed === "true";
  const statusText = isCompleted ? "Completed" : "In progress";
  const goalTypeText = isHabitGoal ? "Habit goal" : "One-time goal";
  const goalId = params.goal_id ? Number(params.goal_id) : null;

  const [isMilestone, setIsMilestone] = useState(params.is_milestone === "true");
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [milestoneType, setMilestoneType] = useState<"" | "streak" | "count">(
    (params.milestone_type as "" | "streak" | "count") || ""
  );
  const [milestoneTarget, setMilestoneTarget] = useState(params.milestone_target || "");
  const [checkInCount, setCheckInCount] = useState(0);
  const [hasDuration, setHasDuration] = useState(false);
  const [duration, setDuration] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isHydrationDemoLoading, setIsHydrationDemoLoading] = useState(false);
  const hasMilestoneTarget = !!milestoneTarget.trim();
  const normalizedTitle = normalizeGoalTitle(params.title);
  const isHydrationDemoGoal = normalizedTitle === HYDRATION_DEMO_GOAL_TITLE;
  const showHydrationDemoTrigger =
    isHydrationDemoGoal && isMilestone && milestoneType === "count" && hasMilestoneTarget;

  let durationText = "";
  let targetDateLabel = "";

  if (hasSavedDuration) {
    const endDate = new Date(params.duration_date as string);
    const diff = endDate.getTime() - Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    if (!Number.isNaN(endDate.getTime())) {
      targetDateLabel = endDate.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      if (diff < 0) {
        durationText = `Overdue by ${(Math.abs(diff) / oneDay).toFixed(1)} days`;
      } else {
        durationText = `${(diff / oneDay).toFixed(1)} days left`;
      }
    }
  }

  const progressSummaryText =
    milestoneType === "count" && hasMilestoneTarget
      ? `${checkInCount} of ${milestoneTarget} check-ins`
      : `Check-ins: ${checkInCount}`;

  const saveMilestone = async () => {
    if (!milestoneType) {
      Alert.alert("Missing milestone type", "Please choose a milestone type.");
      return;
    }

    const parsedTarget = milestoneTarget.trim() === "" ? null : parseInt(milestoneTarget, 10);

    if (parsedTarget !== null && !Number.isFinite(parsedTarget)) {
      Alert.alert("Invalid milestone target", "Please enter a valid milestone target.");
      return;
    }

    if (hasDuration && duration < new Date()) {
      Alert.alert("Invalid duration", "Target date cannot be in the past.");
      return;
    }

    if (goalId === null) {
      Alert.alert("Update failed", "Missing goal id.");
      return;
    }

    const updatePayload: any = {
      is_milestone: true,
      milestone_type: milestoneType,
      milestone_target: parsedTarget,
    };

    if (hasDuration) {
      updatePayload.duration_date = duration.toISOString();
    }

    try {
      await updateGoalMilestone(goalId, updatePayload);
    } catch (error: any) {
      Alert.alert("Update failed", error?.message || "Unexpected database error.");
      return;
    }

    setIsMilestone(true);
    setShowMilestoneForm(false);
    Alert.alert("Saved", "Goal is now a milestone.");
  };

  const loadMilestoneValues = useCallback(async () => {
    if (goalId === null) {
      return;
    }
    try{
      const data = await getGoalById(goalId);

      if (!data) return;

      setIsMilestone(!!data.is_milestone);
      setMilestoneType((data.milestone_type as "" | "streak" | "count") || "");
      setMilestoneTarget(data.milestone_target != null ? String(data.milestone_target) : "");
      setCheckInCount(data.check_in_count ?? 0);
    }catch(error){
      Alert.alert("Error","Could not load milestone data. Please try again.")
    }
  }, [goalId]);

  const addCheckIn = async () => {
    if (goalId === null) {
      Alert.alert("Update failed", "Missing goal id.");
      return;
    }

    try {
      await incrementGoalCheckInCount(goalId);
      await loadMilestoneValues();
    } catch (error: any) {
      Alert.alert("Update failed", error?.message || "Unexpected database error.");
    }
  };

  const triggerHydrationDemo = async () => {
    if (goalId === null) {
      Alert.alert("Demo unavailable", "Missing goal id.");
      return;
    }

    setIsHydrationDemoLoading(true);

    try {
      const target = await setGoalCheckInCountToMilestoneTarget(goalId);

      if (target == null) {
        Alert.alert("Demo unavailable", "This goal is missing a valid check-in target.");
        return;
      }

      await loadMilestoneValues();

      const notificationId = await sendLocalNotificationNow(
        HYDRATION_DEMO_NOTIFICATION_TITLE,
        HYDRATION_DEMO_NOTIFICATION_BODY
      );

      if (!notificationId) {
        Alert.alert(
          "Milestone updated",
          "The hydration milestone was completed, but the notification could not be shown."
        );
      }
    } catch (error: any) {
      Alert.alert("Demo failed", error?.message || "Unexpected database error.");
    } finally {
      setIsHydrationDemoLoading(false);
    }
  };

  useEffect(() => {
    loadMilestoneValues();
  }, [loadMilestoneValues]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
      <Text style={styles.title}>{params.title || "Goal Detail"}</Text>
      <Text style={styles.subtitle}>A quick look at your goal and progress.</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Overview</Text>
        <Text style={styles.rowText}>Category: {params.category || "Other"}</Text>
        <Text style={styles.rowText}>Type: {goalTypeText}</Text>
        <Text style={styles.rowText}>Status: {statusText}</Text>
        {hasDescription && <Text style={styles.rowText}>Why it matters: {params.description}</Text>}
      </View>

      {isMilestone ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Progress</Text>

          {milestoneType === "count" && (
            <>
              <Text style={styles.rowText}>Check-in goal</Text>
              {hasMilestoneTarget && (
                <Text style={styles.rowText}>Target: {milestoneTarget} check-ins</Text>
              )}
              <Text style={styles.rowText}>{progressSummaryText}</Text>
              <Pressable style={styles.primaryButton} onPress={addCheckIn}>
                <Text style={styles.primaryButtonText}>Add check-in</Text>
              </Pressable>
              {showHydrationDemoTrigger && (
                <Pressable
                  onPress={triggerHydrationDemo}
                  disabled={isHydrationDemoLoading}
                  hitSlop={8}
                  style={styles.demoTrigger}
                >
                  <Text style={styles.demoTriggerText}>
                    {isHydrationDemoLoading ? "Triggering hydration demo..." : "Hydration demo"}
                  </Text>
                </Pressable>
              )}
            </>
          )}

          {milestoneType === "streak" && (
            <>
              <Text style={styles.rowText}>Target date goal</Text>
              {targetDateLabel ? (
                <Text style={styles.rowText}>Target date: {targetDateLabel}</Text>
              ) : (
                <Text style={styles.rowText}>Add a target date to track this goal.</Text>
              )}
              {durationText && <Text style={styles.rowText}>{durationText}</Text>}
            </>
          )}
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Milestone</Text>
          <View style={styles.milestoneSection}>
            <Button
              title="Set as milestone"
              onPress={() => setShowMilestoneForm((prev) => !prev)}
            />
            {showMilestoneForm && (
              <>
                <Text style={styles.formLabel}>Milestone type</Text>
                <Picker selectedValue={milestoneType} onValueChange={(value) => setMilestoneType(value)}>
                  <Picker.Item label="Select milestone type" value="" />
                  <Picker.Item label="Target date goal" value="streak" />
                  <Picker.Item label="Check-in goal" value="count" />
                </Picker>

                <Text style={styles.formLabel}>Milestone target</Text>
                <TextInput
                  style={styles.milestoneInput}
                  value={milestoneTarget}
                  onChangeText={setMilestoneTarget}
                  keyboardType="numeric"
                  placeholder="Milestone target"
                />

                <View style={styles.durationSection}>
                  <Checkbox
                    style={styles.checkbox}
                    value={hasDuration}
                    onValueChange={(value) => {
                      setHasDuration(value);
                      setShowDatePicker(value);
                    }}
                  />
                  <Text>Add a target date?</Text>
                </View>

                {showDatePicker && (
                  <DateTimePicker
                    testID="dateTimePicker"
                    value={duration}
                    mode={"date"}
                    is24Hour={true}
                    onChange={(event, selectedDate) => {
                      if (event?.type === "set" && selectedDate) {
                        setDuration(selectedDate);
                      }
                      setShowDatePicker(false);
                    }}
                  />
                )}

                {hasDuration && <Text style={styles.helperText}>Target date: {duration.toLocaleString()}</Text>}
                <Button title="Save Milestone" onPress={saveMilestone} />
              </>
            )}
          </View>
        </View>
      )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f8",
    padding: 16,
  },
  title: {
    color: "#2f3e46",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    color: "#5e6b61",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dfe6e9",
    padding: 14,
    marginBottom: 12,
  },
  cardTitle: {
    color: "#2f3e46",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 8,
  },
  rowText: {
    color: "#2f3e46",
    marginBottom: 8,
    fontSize: 15,
  },
  milestoneSection: {
    marginTop: 8,
  },
  formLabel: {
    color: "#2f3e46",
    marginTop: 8,
    marginBottom: 4,
    fontSize: 15,
    fontWeight: "600",
  },
  milestoneInput: {
    borderWidth: 1,
    borderColor: "#cfe0d1",
    borderRadius: 14,
    backgroundColor: "#fbfdfb",
    padding: 12,
    marginTop: 8,
  },
  durationSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  checkbox: {
    marginRight: 8,
  },
  helperText: {
    color: "#5e6b61",
    marginVertical: 8,
  },
  primaryButton: {
    backgroundColor: "#2e7d32",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  demoTrigger: {
    alignSelf: "center",
    marginTop: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  demoTriggerText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
