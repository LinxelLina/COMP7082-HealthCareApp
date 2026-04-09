import {useRef, useState } from "react";
import { View, Text, StyleSheet, Button, Pressable, Modal, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GoalForm from "../goal_form";
import { createGoal } from "@/services/goals";
import GoalsList from "../goal_list";
import MaterialCommunityIcons from "@expo/vector-icons/build/MaterialCommunityIcons";
import {Category, ICONS, OPTIONS, CATEGORYNAMES} from '../../types/category'
import { GoalFormType } from "../../types/goals";

  
export default function GoalPage() {
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [openNewHabitForm, setOpenNewHabitForm] = useState(false);
    const refreshListRef = useRef<() => void>(() => {});

    async function addCategoryGoalsToDatabase(category: Category, goal: string) {
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
                  <GoalForm onSubmit={(form:GoalFormType) => {
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
                          refreshListRef.current();
                        }}
                    >
                        <Text>{option}</Text>
                    </Pressable>
                    ))}
                </Pressable>
            </Pressable>
        </Modal>

        <Pressable onPress={() => {setOpenNewHabitForm(!openNewHabitForm);}} style={styles.addButton}>
          <Text style={styles.addButtonText}>Add New Habit</Text>    
        </Pressable>

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
    container: {
    flex: 1,
    paddingTop:10,
    backgroundColor: "#fff",
    marginBottom: 0,
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
  addButton:{
    backgroundColor: "#e8f5e9",
    borderWidth: 1,
    borderColor: "#a5d6a7",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 8,
  },
  addButtonText:{
    color: "#2e7d32",
    fontWeight: "600",
    fontSize: 16,
  },

});
