import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, Text, View } from "react-native";

export default function GoalDetailScreen() {
  const params = useLocalSearchParams<{
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

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{params.title || "Goal Detail"}</Text>

      <View style={styles.section}>
        <Text>Category: {params.category || "-"}</Text>
        <Text>Description: {params.description || "-"}</Text>
        <Text>Habit: {params.is_habit || "-"}</Text>
        <Text>Completed: {params.is_completed || "-"}</Text>
        <Text>Milestone Enabled: {params.is_milestone || "-"}</Text>
        <Text>Milestone Type: {params.milestone_type || "-"}</Text>
        <Text>Milestone Target: {params.milestone_target || "-"}</Text>
        <Text>Duration Date: {params.duration_date || "-"}</Text>
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
});
