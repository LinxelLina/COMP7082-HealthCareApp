import {useRef, useState } from "react";
import { View, Text, StyleSheet, FlatList, Button, Pressable, Modal, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GoalForm from "../goal_form";
import { createGoal } from "@/services/goals";
import GoalsList from "../goal_list";
import MaterialCommunityIcons from "@expo/vector-icons/build/MaterialCommunityIcons";

    type Habit = {
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

    type GoalForm = {
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

    type Category = "Food" | "Fitness" | "Mental_Health" | "Social" | "Study" | "Sleep" | "Other";

    type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

    const ICONS: Record<Category, IconName> = {
        Food: "food-fork-drink",
        Fitness: "dumbbell",
        Mental_Health: "brain",
        Social: "account-group",
        Study: "book-alphabet",
        Sleep: "sleep",
        Other: "cloud-question",
    }
    const OPTIONS: Record<Category, string[]> = {
        Food: ["Eat breakfast", "Eat lunch", "Eat dinner", "Snack","Drink more water", "Eat more fruits", "Eat more vegetables"],
        Fitness: ["Go for a walk","Go for a run", "Do yoga", "Lift weights", "Got to the gym", "Go to the pool"],
        Mental_Health: ["Meditate", "Journal", "Practice gratitude", "Take a break", "Go outside", "Practice mindfulness"],
        Social: ["Call a friend", "Meet up with a friend", "Go to a social event", "Join a club", "Volunteer", "Attend a community event"],
        Study: ["Review notes", "Read a book", "Practice problems", "Attend a study group", "Watch educational videos", "Take practice tests"],
        Sleep: ["Go to bed earlier", "Wake up earlier", "Take a nap", "Create a bedtime routine", "Limit screen time before bed", "Avoid caffeine in the evening"],
        Other: ["Practice a hobby", "Learn something new", "Organize your space", "Set goals for the week", "Reflect on your day","test","test2","test4"]
    }

    const CATEGORYNAMES: Record<Category, string> = {
        Food: "Food",
        Fitness: "Fitness",
        Mental_Health: "Mental Health",
        Social: "Social",
        Study: "Study",
        Sleep: "Sleep",
        Other: "Other"
    }
export default function goal_page() {
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [openNewHabitForm, setOpenNewHabitForm] = useState(false);
    const refreshListRef = useRef<() => void>(() => {});

    async function addCategoryGoalsToDatabase(category: Category, goal: string) {
      console.log(category, goal);
      try {
        const savedId = await createGoal({
          title: goal.trim(),
          description: `Added from category selection: ${category}`,
          category,
          is_habit: false,
          is_completed: false,
        });
        return savedId?.toString() ?? null;
      } catch (error: any) {
        Alert.alert("Save failed", error?.message || "Unexpected database error.");
        return null;
      }
    }

    return (
    <>
    <SafeAreaView style={styles.container} edges={['top','left','right']}>

        {openNewHabitForm && (
            <Pressable
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.3)',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000,
              }}
              onPress={() => setOpenNewHabitForm(false)} 
            >
                <View
                  style={{
                    width: '90%',
                    height: '80%',
                    backgroundColor: 'white',
                    borderRadius: 16,
                    padding: 16,
                  }}
                  onStartShouldSetResponder={() => true}
                >
                  <GoalForm onSubmit={(form:GoalForm) => {
                    console.log(form);
                    if (form.newHabit && form.category in OPTIONS) {
                      OPTIONS[form.category as Category].push(form.goal);
                    }
                    setOpenNewHabitForm(false);
                    refreshListRef.current();
                  }}/>
                </View>
            </Pressable>
        )}

        <GoalsList showDropdownOverlay={true} disableDropdown={openNewHabitForm} onRefresh={(fn) => {refreshListRef.current = fn;}}/>
            
        <Modal
            visible={selectedCategory !== null}
            transparent
            animationType="slide"
        >
            <Pressable
                style={styles.modalOverlay}
                onPress={() => setSelectedCategory(null)}
            >
                <Pressable style={styles.modalContent} onPress={() => {}}>

                <Text style={styles.modalTitle}>{selectedCategory}</Text>
                {selectedCategory &&
                    OPTIONS[selectedCategory].map((option) => (
                    <Pressable
                        key={option}
                        style={styles.option}
                        onPress={async () => {
                          const savedId = await addCategoryGoalsToDatabase(selectedCategory, option);
                          if (!savedId) return;
                          // setSelectedCategory(null);
                          refreshListRef.current();
                        }}
                    >
                        <Text>{option}</Text>
                    </Pressable>
                    ))}
                </Pressable>
            </Pressable>
        </Modal>

        <Button title="Add New Habit" onPress={() => {
          setOpenNewHabitForm(!openNewHabitForm);}}/>

        <View style={styles.categoryBar}>
            {Object.keys(OPTIONS).map((category) => (
                <Pressable
                    key={category}
                    onPress={() => setSelectedCategory(category as Category)}
                    style={styles.categoryButton}
                    >
                    <MaterialCommunityIcons name={ICONS[category as Category]} size={24} color="black" />
                    <Text style={styles.categoryText}>{CATEGORYNAMES[category as Category]}</Text>
                </Pressable>
            ))}
        </View>
    </SafeAreaView>
    </>
    );  
}

const styles = StyleSheet.create({
  item: {
    padding: 16,
  },
  separator: {
    height: 1,
    backgroundColor: "#ccc",
    marginHorizontal: 16,
  },
    container: {
    flex: 1,
    paddingTop:10,
    backgroundColor: "#fff",
    marginBottom: 0,
  },
  picker: {
    marginHorizontal: 16,
  },
  categoryList:{
    flex:1,
  },
  item2: {
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  separator2: {
    height: 1,
    backgroundColor: "#ddd",
    marginHorizontal: 16,
  },
  categoryBar: {
    height:80,
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "white",
  },
    categoryButton: {
    flex: 1,
    padding: 16,
    alignItems: "center",
  },
  categoryText: {
    fontWeight: "600",
    fontSize: 6,
    color: "#333",
  },
    modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  option: {
    paddingVertical: 12,
  },
});
