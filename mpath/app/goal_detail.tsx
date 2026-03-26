import { useEffect, useState } from "react";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";
import { Checkbox } from "expo-checkbox";
import DateTimePicker from "@react-native-community/datetimepicker";
import { getGoalById, updateGoalMilestone } from "@/services/goals";

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
  const [isMilestone, setIsMilestone] = useState(params.is_milestone === "true");
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [milestoneType, setMilestoneType] = useState<"" | "streak" | "count">(
    (params.milestone_type as "" | "streak" | "count") || ""
  );
  const [milestoneTarget, setMilestoneTarget] = useState(params.milestone_target || "");
  const [hasDuration, setHasDuration] = useState(false);
  const [duration, setDuration] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const hasMilestoneType = !!milestoneType.trim();
  const hasMilestoneTarget = !!milestoneTarget.trim();
  let durationText = "";

  if (hasSavedDuration) {
    const endDate = new Date(params.duration_date as string);
    const diff = endDate.getTime() - Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    if (!Number.isNaN(endDate.getTime())) {
      if (diff < 0) {
        durationText = `Overdue by ${(Math.abs(diff) / oneDay).toFixed(1)} days`;
      } else {
        durationText = `${(diff / oneDay).toFixed(1)} days left`;
      }
    }
  }

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
    if (!params.goal_id) {
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
      await updateGoalMilestone(Number(params.goal_id), updatePayload);
    } catch (error: any) {
      Alert.alert("Update failed", error?.message || "Unexpected database error.");
      return;
    }

    setIsMilestone(true);
    setShowMilestoneForm(false);
    Alert.alert("Saved", "Goal is now a milestone.");
  };

  useEffect(() => {
    const loadMilestoneValues = async () => {
      if (!params.goal_id) return;
      const data = await getGoalById(Number(params.goal_id));

      if (!data) return;

      setIsMilestone(!!data.is_milestone);
      setMilestoneType((data.milestone_type as "" | "streak" | "count") || "");
      setMilestoneTarget(data.milestone_target != null ? String(data.milestone_target) : "");
    };

    loadMilestoneValues();
  }, [params.goal_id]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{params.title || "Goal Detail"}</Text>

      <View style={styles.infoBox}>
        <Text style={styles.rowText}>Category: {params.category || "-"}</Text>
        <Text style={styles.rowText}>Habit: {params.is_habit || "-"}</Text>
        <Text style={styles.rowText}>Completed: {params.is_completed || "-"}</Text>
        {hasDescription && <Text style={styles.rowText}>Description: {params.description}</Text>}
        {hasSavedDuration && durationText && <Text style={styles.rowText}>Duration: {durationText}</Text>}
        {isMilestone && <Text style={styles.rowText}>Milestone Enabled: true</Text>}
        {isMilestone && hasMilestoneType && (
          <Text style={styles.rowText}>Milestone Type: {params.milestone_type}</Text>
        )}
        {isMilestone && hasMilestoneTarget && (
          <Text style={styles.rowText}>Milestone Target: {params.milestone_target}</Text>
        )}

        {!isMilestone && (
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
                  <Picker.Item label="Streak" value="streak" />
                  <Picker.Item label="Count" value="count" />
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
                  <Text>Set target date?</Text>
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
                {hasDuration && <Text>selected: {duration.toLocaleString()}</Text>}
                <Button title="Save Milestone" onPress={saveMilestone} />
              </>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
  },
  infoBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  rowText: {
    marginBottom: 8,
  },
  milestoneSection: {
    marginTop: 8,
  },
  formLabel: {
    marginTop: 8,
    marginBottom: 4,
    fontWeight: "600",
  },
  milestoneInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
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
});
