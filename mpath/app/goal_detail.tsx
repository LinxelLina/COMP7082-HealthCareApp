import { useEffect, useState } from "react";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";
import { Checkbox } from "expo-checkbox";
import DateTimePicker from "@react-native-community/datetimepicker";
import { supabase } from "@/utils/supabase";

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
  const hasDurationDate = !!params.duration_date?.trim();
  const [isMilestone, setIsMilestone] = useState(params.is_milestone === "true");
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [milestoneType, setMilestoneType] = useState<"" | "streak" | "count">((params.milestone_type as "" | "streak" | "count") || "");
  const [milestoneTarget, setMilestoneTarget] = useState(params.milestone_target || "");
  const [hasDuration, setHasDuration] = useState(false);
  const [duration, setDuration] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const hasMilestoneType = !!milestoneType.trim();
  const hasMilestoneTarget = !!milestoneTarget.trim();
  let durationCountdown = "";

  if (hasDurationDate) {
    const due = new Date(params.duration_date as string);
    const diffMs = due.getTime() - Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    if (Number.isNaN(due.getTime())) {
      durationCountdown = "";
    } else if (diffMs < 0) {
      const overdueDays = (Math.abs(diffMs) / dayMs).toFixed(1);
      durationCountdown = `Overdue by ${overdueDays} days`;
    } else {
      const daysLeft = (diffMs / dayMs).toFixed(1);
      durationCountdown = `${daysLeft} days left`;
    }
  }

  const setAsMilestone = async () => {
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

    const { error } = await supabase
      .from("goals")
      .update(updatePayload)
      .eq("goal_id", params.goal_id);

    if (error) {
      Alert.alert("Update failed", error.message);
      return;
    }

    setIsMilestone(true);
    setShowMilestoneForm(false);
    Alert.alert("Saved", "Goal is now a milestone.");
  };

  useEffect(() => {
    const loadMilestoneValues = async () => {
      if (!params.goal_id) return;
      const { data, error } = await supabase
        .from("goals")
        .select("is_milestone, milestone_type, milestone_target")
        .eq("goal_id", params.goal_id)
        .single();

      if (error || !data) return;

      setIsMilestone(data.is_milestone ?? false);
      setMilestoneType((data.milestone_type as "" | "streak" | "count") || "");
      setMilestoneTarget(data.milestone_target != null ? String(data.milestone_target) : "");
    };

    loadMilestoneValues();
  }, [params.goal_id]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{params.title || "Goal Detail"}</Text>

      <View style={styles.section}>
        <Text>Category: {params.category || "-"}</Text>
        <Text>Habit: {params.is_habit || "-"}</Text>
        <Text>Completed: {params.is_completed || "-"}</Text>
        {hasDescription && <Text>Description: {params.description}</Text>}
        {hasDurationDate && durationCountdown && <Text>Duration: {durationCountdown}</Text>}
        {isMilestone && <Text>Milestone Enabled: true</Text>}
        {isMilestone && hasMilestoneType && <Text>Milestone Type: {params.milestone_type}</Text>}
        {isMilestone && hasMilestoneTarget && <Text>Milestone Target: {params.milestone_target}</Text>}
        {!isMilestone && (
          <View style={styles.milestoneSection}>
            <Button title="Set as milestone" onPress={() => setShowMilestoneForm((prev) => !prev)} />
            {showMilestoneForm && (
              <>
                <Picker selectedValue={milestoneType} onValueChange={(value) => setMilestoneType(value)}>
                  <Picker.Item label="Select milestone type" value="" />
                  <Picker.Item label="Streak" value="streak" />
                  <Picker.Item label="Count" value="count" />
                </Picker>
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
                <Button title="Save Milestone" onPress={setAsMilestone} />
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
  section: {
    gap: 8,
  },
  milestoneSection: {
    marginTop: 8,
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
