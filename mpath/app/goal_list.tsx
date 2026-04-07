import {useCallback, useEffect, useState } from "react";
import { View, StyleSheet, FlatList, Pressable, Alert } from "react-native";
import  SwipeRow from "./swipableComponent";
import DropDownPicker from "react-native-dropdown-picker";
import { deleteGoal, listGoals, type GoalRecord, updateGoalCompletion } from "@/services/goals";
import { router, useFocusEffect } from "expo-router";
import { addDonation, getProfile } from "@/services/profile";
import { supabase } from "@/utils/supabase";

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
      reminderEnabled: boolean;
      reminderTime: Date;
      isMilestone: boolean;
      milestoneType: string;
      milestoneTarget: number | null;
    }

    type Category = "Food" | "Fitness" | "Mental_Health" | "Social" | "Study" | "Sleep" | "Other";

    const OPTIONS: Record<Category, string[]> = {
        Food: ["Eat breakfast", "Eat lunch", "Eat dinner", "Snack","Drink more water", "Eat more fruits", "Eat more vegetables"],
        Fitness: ["Go for a walk","Go for a run", "Do yoga", "Lift weights", "Got to the gym", "Go to the pool"],
        Mental_Health: ["Meditate", "Journal", "Practice gratitude", "Take a break", "Go outside", "Practice mindfulness"],
        Social: ["Call a friend", "Meet up with a friend", "Go to a social event", "Join a club", "Volunteer", "Attend a community event"],
        Study: ["Review notes", "Read a book", "Practice problems", "Attend a study group", "Watch educational videos", "Take practice tests"],
        Sleep: ["Go to bed earlier", "Wake up earlier", "Take a nap", "Create a bedtime routine", "Limit screen time before bed", "Avoid caffeine in the evening"],
        Other: ["Practice a hobby", "Learn something new", "Organize your space", "Set goals for the week", "Reflect on your day","test","test2","test4"]
    }
  type GoalsListProps = {
    showDropdownOverlay?: boolean;
    disableDropdown?: boolean;
    onRefresh?: (fn: () => void) => void;
  };

export default function GoalsList({ showDropdownOverlay, disableDropdown, onRefresh }: GoalsListProps) {
    const [currentList, setCurrentList] = useState<Habit[]>([]);
    const [visibleList, setVisibleList] = useState<Habit[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [openNewHabitForm, setOpenNewHabitForm] = useState(false);
    const [isOpen, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [items, setItems] = useState([
      {label: 'All', value: 'All'},
      {label: 'Food', value: 'Food'},
      {label: 'Fitness', value: 'Fitness'},
      {label: 'Mental Health', value: 'Mental_Health'},
      {label: 'Social', value: 'Social'},
      {label: 'Study', value: 'Study'},
      {label: 'Sleep', value: 'Sleep'},
      {label: 'Milestones', value: 'Milestones'},
      {label: 'Other', value: 'Other'}
    ]);

    useFocusEffect(
      useCallback(() => {
      fetchData();
      }, [])
    );

    const filterList = value === "All" || value === null ? currentList 
    : value === "Milestones" ? currentList.filter(item => item.isMilestone) 
    : currentList.filter(item => item.category === value);

    const getRemainingTime = (endDate: string) => {
      const diff = new Date(endDate).getTime() - Date.now();

      if (diff <= 0) return "Expired";

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);

      return `${hours}h ${minutes}m`;
    };

    const mapGoalRecordToHabit = (goal: GoalRecord): Habit => ({
      id: goal.id.toString(),
      goal: goal.title,
      description: goal.description ?? "",
      category: goal.category ?? "Other",
      newHabit: !!goal.is_habit,
      isMilestone: !!goal.is_milestone,
      milestoneType: goal.milestone_type ?? "",
      milestoneTarget: goal.milestone_target ?? null,
      start_date: goal.created_at ? new Date(goal.created_at) : new Date(),
      hasDuration: goal.duration_date != null,
      duration: goal.duration_date ? new Date(goal.duration_date) : new Date(),
      isComplete: !!goal.is_completed,
    });

    const fetchData = async () => {
      try {
        const data = await listGoals();
        const mappedData = data.map(mapGoalRecordToHabit);
        // console.log(mappedData);
        //delete goals that have expired and are marked as complete, append remaining time to goals that have expired but are not marked as complete, and append remaining time to goals that have a duration
        for (const goal of mappedData || []) {
          if (goal.hasDuration) {
            const remainingTime = getRemainingTime(goal.duration.toISOString());
            if(remainingTime === "Expired" && goal.isComplete) {
              await deleteGoal(Number(goal.id));
            }else if (remainingTime === "Expired" && !goal.isComplete) {
              goal.goal += " (Expired)";
            }else {
              goal.goal += ` (${remainingTime} remaining)`;
            }
          }
        }
          // delete goals a day old that don't have durations
        const oneDay = 24 * 60 * 60 * 1000;
        for (const goal of mappedData || []) {
          if (!goal.hasDuration && goal.isComplete) {
            const createdAt = new Date(goal.start_date);
            if (Date.now() - createdAt.getTime() > oneDay){
              await deleteGoal(Number(goal.id));
            }
          }  
        }

        setCurrentList(prev => {
          // Only update if something actually changed
          const isSame = prev.length === mappedData.length &&
            prev.every((item, i) => 
              item.id === mappedData[i].id && 
              item.isComplete === mappedData[i].isComplete
            );
          return isSame ? prev : mappedData;
        });
      } catch (error) {
        console.error('Error fetching goals:', error);
      }
    };

    useEffect(() => { //get goals from database,
      fetchData();
    },[]);

    useEffect(() => {
      if (onRefresh) onRefresh(fetchData);
    }, [onRefresh]);

    useEffect(() => {
      if(value === "All" || value === null) {
        setVisibleList(currentList);
      } else {
        setVisibleList(filterList);
      }
    }, [value]);

  useEffect(() => {
      // const sortedList = [...currentList].sort((a, b) =>  Number(a.isComplete) - Number(b.isComplete));
      // sortedList.sort((a, b) => {return a.goal.localeCompare(b.goal)});
      const sortedList = [...currentList].sort((a, b) => { return (Number(a.isComplete) - Number(b.isComplete)) || a.goal.localeCompare(b.goal)});
      setVisibleList(sortedList);
    }, [currentList]);
    
    const deleteItem = (id: string) => {
      Alert.alert(
        "Delete Habit",
        "Are you sure you want to delete this habit?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteGoal(Number(id));
                setCurrentList(prev =>
                  prev.filter(item => item.id !== id)
                );
              } catch (error) {
                console.error('Error deleting goal:', error);
              }
            }
          }
        ]
      );
    };


    const toggleComplete = async (id: string) => {
      const profileData = await getProfile();
      if(profileData?.current_charity == null) {
        Alert.alert("No Charity Selected", "Please select a charity in your profile to earn points for completing goals.");
        return;
      }

      async function updateCharityPoint(){
        const {error} = await supabase.rpc("increment_contribution_by_name", { 
          charity_name: profileData.current_charity,
          contribution: 1  // ← pass whatever value you want here
        });
        if (error) {
          Alert.alert("Error", "There was an issue updating the charity points. Please try again.");
        }

        await addDonation(1);
      }
      updateCharityPoint();


      const nextValue = !currentList.find(item => item.id === id)?.isComplete;
      await updateGoalCompletion(Number(id), nextValue);

      setCurrentList(prev =>
        prev.map(item =>
          item.id === id ? { ...item, isComplete: !item.isComplete } : item
        )
      );
    };


    return (
    <View style={{flex: 1}}>
        <DropDownPicker
          open={isOpen}
          value={value}
          items={items}
          setOpen={setOpen}
          setValue={setValue}
          setItems={setItems}
          placeholder="Select category"
          disabled={disableDropdown}
          zIndexInverse={disableDropdown ? 1 : 1000}
          zIndex={disableDropdown ? 1 : 1000}
          style={{ borderColor: "#ccc", opacity: disableDropdown ? 0.5 : 1}}
          
        />
        {showDropdownOverlay && disableDropdown && (
          <View style={styles.dropdownOverlay} />
          )}
        <FlatList
            data={visibleList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/goal_detail",
                    params: {
                      goal_id: item.id,
                      title: item.goal,
                      description: item.description,
                      category: item.category,
                      is_habit: String(item.newHabit),
                      is_completed: String(item.isComplete),
                      is_milestone: String(item.isMilestone),
                      milestone_type: item.milestoneType,
                      milestone_target: item.milestoneTarget != null ? String(item.milestoneTarget) : "",
                      duration_date: item.hasDuration ? item.duration.toISOString() : "",
                    },
                  })
                }
                onLongPress={() => toggleComplete(item.id)}
              >
                <SwipeRow
                  item={item}
                  onDelete={deleteItem}
                />
              </Pressable>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator2} />}
            contentInsetAdjustmentBehavior="never"
            automaticallyAdjustContentInsets={false}
            contentContainerStyle={{ paddingTop: 0 }}
        />
            
    </View>
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
    backgroundColor: "#fff",
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
    // flex: 1,
    padding: 16,
    alignItems: "center",
  },
  categoryText: {
    fontWeight: "600",
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
  dropdownOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: "rgba(0,0,0,0.3)",
  marginTop: 50, // push it below the dropdown itself
},
});
