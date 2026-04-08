import {useCallback, useEffect, useState } from "react";
import { View, StyleSheet, FlatList, Pressable, Alert } from "react-native";
import  SwipeRow from "./swipableComponent";
import DropDownPicker from "react-native-dropdown-picker";
import { deleteGoal, fetchAndCleanGoals, updateGoalCompletion } from "@/services/goals";
import { router, useFocusEffect } from "expo-router";
import { getProfile } from "@/services/profile";
import { GoalsListProps } from "../types/goals";
import { Habit } from "../types/habit";
import { updateCharityPoint } from "@/services/supabase";

export default function GoalsList({ showDropdownOverlay,disableDropdown, onRefresh }: GoalsListProps) {
    const [currentList, setCurrentList] = useState<Habit[]>([]);
    const [visibleList, setVisibleList] = useState<Habit[]>([]);
    const [isOpen, setOpen] = useState(false);
    const [value, setValue] = useState<string | null>(null);
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

    const fetchData = async () => {
      try {
        const goals = await fetchAndCleanGoals()

        setCurrentList(prev => {
          // Only update if something actually changed
          const isSame = prev.length === goals.length &&
            prev.every((item, i) => 
              item.id === goals[i].id && 
              item.isComplete === goals[i].isComplete
            );
          return isSame ? prev : goals;
        });
      } catch (error) {
        console.error('Error fetching goals:', error);
        Alert.alert("Error", "Could not load goals. Please try again.");
      }
    };
    
    const deleteItem = (id: string) => { //above useEffects because useEffects use this
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
                const item_id = Number(id);
                if(isNaN(item_id)) return;
                await deleteGoal(item_id);
                setCurrentList(prev =>
                  prev.filter(item => item.id !== id)
                );
              } catch (error) {
                console.error('Error deleting goal:', error);
                Alert.alert("Error", "Could not delete habit. Please try again.");
              }
            }
          }
        ]
      );
    };

    useFocusEffect( //gets goals from database
      useCallback(() => {
      fetchData();
      }, [])
    );

    useEffect(() => {
      if (onRefresh) onRefresh(fetchData);
    }, [onRefresh]);

    useEffect(() => {
      let filtered = currentList;

      if (value && value !== "All") {
        if (value === "Milestones") {
          filtered = currentList.filter(item => item.isMilestone);
        } else {
          filtered = currentList.filter(item => item.category === value);
        }
      }

      const sorted = [...filtered].sort(
        (a, b) => (Number(a.isComplete) - Number(b.isComplete)) || a.goal.localeCompare(b.goal)
      );

      setVisibleList(sorted);
    }, [currentList, value]);


    const toggleComplete = async (id: string) => {
      let profileData:Awaited<ReturnType<typeof getProfile>>;
      try{
        profileData = await getProfile();
      }catch(error){
        Alert.alert("Error","Could not load profile, please try again.")
        return;
      }
      if(profileData?.current_charity == null) {
        Alert.alert("No Charity Selected", "Please select a charity in your profile to earn points for completing goals.");
        return;
      }

      try{
        await updateCharityPoint(profileData.current_charity);

        const nextValue = !currentList.find(item => item.id === id)?.isComplete;
        await updateGoalCompletion(Number(id), nextValue);

        setCurrentList(prev =>
          prev.map(item =>
            item.id === id ? { ...item, isComplete: !item.isComplete } : item
          )
        );
      } catch (error){
        console.error('Error completing goal', error);
        Alert.alert("Error", "Could not complete goal. Please try again.");
      }
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
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentInsetAdjustmentBehavior="never"
            automaticallyAdjustContentInsets={false}
            contentContainerStyle={{ paddingTop: 0 }}
        />
            
    </View>
    );  
}

const styles = StyleSheet.create({
  separator: {
    height: 1,
    backgroundColor: "#ddd",
    marginHorizontal: 16,
  },
  dropdownOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: "rgba(0,0,0,0.3)",
  marginTop: 50, // push it below the dropdown itself
},
});
