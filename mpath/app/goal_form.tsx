import { createGoal, updateGoalReminder } from "@/services/goals";
import { scheduleDailyGoalReminder } from "@/utils/notifications";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from "@react-native-picker/picker";
import { Checkbox } from 'expo-checkbox';
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import {ScrollView} from "react-native-gesture-handler";

type GoalFormValues = {
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

type GoalFormProps = {
  onSubmit?: (form: GoalFormValues) => void;
};

export default function GoalForm({ onSubmit = () => {} }: GoalFormProps) {
  const [form, setForm] = useState<GoalFormValues>({
    goal: "",
    description: "",
    category: "",
    newHabit: false,
    hasDuration: false,
    duration: new Date(),
    isComplete: false,
    isMilestone: false,
    milestoneType: "",
    milestoneTarget: null,
    reminderEnabled: false,
    reminderTime: new Date(),
  });
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);

  const updateForm = (changes: Partial<GoalFormValues>) => {
    setForm((currentForm) => ({ ...currentForm, ...changes }));
  };

  const handleGoalChange = (goal: string) => {
    updateForm({ goal });
  };

  const handleDescriptionChange = (description: string) => {
    updateForm({ description });
  };

  const handleCategoryChange = (category: string) => {
    updateForm({ category });
  };

  const handleHabitToggle = (newHabit: boolean) => {
    updateForm({ newHabit });
  };

  const handleReminderToggle = (reminderEnabled: boolean) => {
    updateForm({ reminderEnabled });
    setShowReminderPicker(reminderEnabled);
  };

  const handleMilestoneToggle = (isMilestone: boolean) => {
    if (!isMilestone) {
      updateForm({
        isMilestone: false,
        hasDuration: false,
        milestoneType: "",
        milestoneTarget: null,
      });
      setShowDatePicker(false);
      return;
    }

    updateForm({ isMilestone: true });
  };

  const handleMilestoneTypeChange = (value: string) => {
    const nextMilestoneType = value as "" | "streak" | "count";

    if (nextMilestoneType === "count") {
      updateForm({
        milestoneType: nextMilestoneType,
        hasDuration: false,
      });
      setShowDatePicker(false);
      return;
    }

    updateForm({ milestoneType: nextMilestoneType });
  };

  const handleMilestoneTargetChange = (text: string) => {
    const trimmedText = text.trim();

    if (trimmedText === "") {
      updateForm({ milestoneTarget: null });
      return;
    }

    const parsedTarget = parseInt(text, 10);
    updateForm({ milestoneTarget: Number.isNaN(parsedTarget) ? null : parsedTarget });
  };

  const handleDurationToggle = (hasDuration: boolean) => {
    updateForm({ hasDuration });
    setShowDatePicker(hasDuration);
  };

  const onChange = (event: any, selectedDate: any) => {
    if (event?.type !== "set" || !selectedDate) {
      return;
    }

    setDate(selectedDate);
    updateForm({ duration: selectedDate });
  };

  const onReminderChange = (event: any, selectedTime: any) => {
    if (event?.type === "set" && selectedTime) {
      updateForm({ reminderTime: selectedTime });
    }

    setShowReminderPicker(false);
  };

  const formatReminderTime = (value: Date) => {
    const hours = value.getHours().toString().padStart(2, "0");
    const minutes = value.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const formatReminderLabel = (value: Date) =>
    value.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  const formatTargetDateLabel = (value: Date) => {
    const dateLabel = value.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const timeLabel = value.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
    return `${dateLabel} at ${timeLabel}`;
  };

  const milestoneTargetPlaceholder =
    form.milestoneType === "streak" ? "Example: 14 days" : "Example: 20 check-ins";

  const goalTitle = form.goal.trim();
  const goalDescription = form.description.trim();

  const getValidationError = () => {
    if (!goalTitle) {
      return {
        title: "Add a goal title",
        message: "Start with something simple, like Drink Water.",
      };
    }

    if (form.hasDuration && !form.duration) {
      return {
        title: "Missing target date",
        message: "Please choose when you want to reach this goal.",
      };
    }

    if (form.hasDuration && form.duration < new Date()) {
      return {
        title: "Invalid target date",
        message: "Choose a date and time in the future.",
      };
    }

    if (form.hasDuration && form.duration > new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)) {
      return {
        title: "Invalid target date",
        message: "Please choose a date within the next year.",
      };
    }

    if (form.isMilestone && !form.milestoneType) {
      return {
        title: "Choose a tracking style",
        message: "Pick how you want to track this milestone.",
      };
    }

    return null;
  };

  async function onSubmitHandler() {
    const validationError = getValidationError();

    if (validationError) {
      Alert.alert(validationError.title, validationError.message);
      return;
    }

    const reminderTime = form.reminderEnabled ? formatReminderTime(form.reminderTime) : null;

    let savedGoalId: number | null = null;
    try {
      savedGoalId = await createGoal({
        title: goalTitle,
        description: goalDescription,
        category: form.category || "Other",
        duration_date: form.hasDuration ? form.duration.toISOString() : null,
        is_habit: form.newHabit,
        is_completed: form.isComplete,
        is_milestone: form.isMilestone,
        milestone_type: form.isMilestone ? form.milestoneType : null,
        milestone_target: form.isMilestone ? form.milestoneTarget : null,
        reminder_enabled: form.reminderEnabled,
        reminder_time: reminderTime,
      });
    } catch (error: any) {
      Alert.alert("Save failed", error?.message || "Something went wrong while saving your goal.");
      return;
    }

    if (form.reminderEnabled && savedGoalId != null) {
      try {
        const notificationId = await scheduleDailyGoalReminder(
          goalTitle,
          reminderTime ?? "09:00"
        );

        if (notificationId) {
          await updateGoalReminder(savedGoalId, notificationId);
        } else {
          Alert.alert(
            "Reminder not scheduled",
            "Your goal was saved, but notification permission was not granted."
          );
        }
      } catch (error: any) {
        Alert.alert(
          "Reminder not scheduled",
          error?.message || "Your goal was saved, but the reminder could not be scheduled."
        );
      }
    }

    onSubmit(form);
    Alert.alert(
      "You're all done",
      form.reminderEnabled
        ? "Your goal is set, and your daily reminder is on."
        : "Your goal is set."
    );
  }

  return (
    // <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Create a Goal</Text>
        <Text style={styles.subtitle}>Add a reminder or track progress if you want!</Text>

        <View style={styles.card}>
          <Text style={styles.inputLabel}>Goal title</Text>
          <TextInput
            style={styles.input}
            value={form.goal}
            onChangeText={handleGoalChange}
            placeholder="Call Mom every Monday"
            placeholderTextColor="#7c8c7d"
          />

          <Text style={styles.inputLabel}>Category</Text>
          <View style={styles.pickerShell}>
            <Picker selectedValue={form.category} onValueChange={handleCategoryChange}>
              <Picker.Item label="Choose a category" value="" />
              <Picker.Item label="Food" value="Food" />
              <Picker.Item label="Fitness" value="Fitness" />
              <Picker.Item label="Mental Health" value="Mental_Health" />
              <Picker.Item label="Social" value="Social" />
              <Picker.Item label="Study" value="Study" />
              <Picker.Item label="Sleep" value="Sleep" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>

          <View style={styles.toggleRow}>
            <Checkbox
              style={styles.checkbox}
              value={form.newHabit}
              onValueChange={handleHabitToggle}
              color={form.newHabit ? "#2e7d32" : undefined}
            />
            <Text style={styles.toggleTitle}>Show this in Goals</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.optionHeader}>
            <Text style={styles.optionTitle}>Daily reminder</Text>
            <Checkbox
              style={styles.checkbox}
              value={form.reminderEnabled}
              onValueChange={handleReminderToggle}
              color={form.reminderEnabled ? "#2e7d32" : undefined}
            />
          </View>

          {showReminderPicker && (
            <View style={styles.inlinePanel}>
              <Text style={styles.inlineTitle}>Reminder time</Text>
              <DateTimePicker
                testID="reminderTimePicker"
                value={form.reminderTime}
                mode={"time"}
                is24Hour={true}
                onChange={onReminderChange}
              />
            </View>
          )}

          {form.reminderEnabled && (
            <Text style={styles.summaryText}>Reminder time: {formatReminderLabel(form.reminderTime)}</Text>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.optionHeader}>
            <Text style={styles.optionTitle}>Track a milestone</Text>
            <Checkbox
              style={styles.checkbox}
              value={form.isMilestone}
              onValueChange={handleMilestoneToggle}
              color={form.isMilestone ? "#2e7d32" : undefined}
            />
          </View>

          {form.isMilestone && (
            <>
              <View style={styles.pickerShell}>
                <Picker
                  selectedValue={form.milestoneType}
                  onValueChange={handleMilestoneTypeChange}
                >
                  <Picker.Item label="Choose a tracking style" value="" />
                  <Picker.Item label="Pick a target date" value="streak" />
                  <Picker.Item label="Reach a target number" value="count" />
                </Picker>
              </View>

              <TextInput
                style={styles.input}
                value={form.milestoneTarget !== null ? String(form.milestoneTarget) : ""}
                onChangeText={handleMilestoneTargetChange}
                keyboardType="numeric"
                placeholder={milestoneTargetPlaceholder}
                placeholderTextColor="#7c8c7d"
              />

              {form.milestoneType === "streak" && (
                <>
                  <View style={styles.toggleRow}>
                    <Checkbox
                      style={styles.checkbox}
                      value={form.hasDuration}
                      onValueChange={handleDurationToggle}
                      color={form.hasDuration ? "#2e7d32" : undefined}
                    />
                    <Text style={styles.toggleTitle}>Add a target date</Text>
                  </View>

                  {showDatePicker && (
                    <View style={styles.inlinePanel}>
                      <Text style={styles.inlineTitle}>Target date and time</Text>
                      <DateTimePicker
                        testID="dateTimePicker"
                        value={date}
                        mode={"date"}
                        is24Hour={true}
                        onChange={onChange}
                      />
                      <DateTimePicker
                        testID="dateTimePicker"
                        value={date}
                        mode={"time"}
                        is24Hour={true}
                        onChange={onChange}
                      />
                    </View>
                  )}

                  {form.hasDuration && (
                    <Text style={styles.summaryText}>Target date: {formatTargetDateLabel(form.duration)}</Text>
                  )}
                </>
              )}
            </>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.inputLabel}>Why does this matter to you? <Text style={styles.optional}>(optional)</Text></Text>
          <TextInput
            style={[styles.input, styles.textArea, styles.lastInput]}
            value={form.description}
            onChangeText={handleDescriptionChange}
            placeholder="A short note can help you stay motivated."
            placeholderTextColor="#7c8c7d"
            multiline
            textAlignVertical="top"
          />
        </View>

        <Pressable style={styles.primaryButton} onPress={onSubmitHandler}>
          <Text style={styles.primaryButtonText}>Save Goal</Text>
        </Pressable>
      </ScrollView>
    // </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f8",
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  title: {
    color: "#2f3e46",
    fontSize: 26,
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
    marginBottom: 10,
  },
  inputLabel: {
    color: "#2f3e46",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cfe0d1",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#fbfdfb",
    fontSize: 16,
    marginBottom: 10,
    color: "#203126",
  },
  optional: {
    color: "#6d7d70",
    fontWeight: "500",
  },
  textArea: {
    minHeight: 64,
    maxHeight: 84,
  },
  lastInput: {
    marginBottom: 0,
  },
  pickerShell: {
    borderWidth: 1,
    borderColor: "#cfe0d1",
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#fbfdfb",
    marginBottom: 10,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7faf7",
    borderWidth: 1,
    borderColor: "#dce8dd",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
  },
  optionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  optionTitle: {
    color: "#2f3e46",
    fontSize: 17,
    fontWeight: "700",
  },
  checkbox: {
    marginRight: 10,
  },
  toggleTitle: {
    color: "#2f3e46",
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  inlinePanel: {
    backgroundColor: "#f7faf7",
    borderWidth: 1,
    borderColor: "#dce8dd",
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
  },
  inlineTitle: {
    color: "#2f3e46",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  summaryText: {
    color: "#2e7d32",
    fontSize: 14,
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: "#2e7d32",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
});
