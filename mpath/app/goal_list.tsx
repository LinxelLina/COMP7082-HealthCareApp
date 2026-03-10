import {use, useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Button, Pressable, Modal, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import  SwipeRow from "./swipableComponent";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import GoalForm from "./goal_form";
import DropDownPicker from "react-native-dropdown-picker";
import { supabase } from "@/utils/supabase";
import { router } from "expo-router";

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
    }
      
    const temp_goal_list: Habit[]=
    [
      { id: "1", goal: "Drink more water", category: "Food", newHabit: true, hasDuration: false, duration: new Date(), isComplete: false, start_date: new Date() },
      { id: "2", goal: "Eat more food", category: "Food", newHabit: true, hasDuration: false, duration: new Date(), isComplete: false, start_date: new Date() },
      { id: "3", goal: "Feed the fish", category: "Other", newHabit: true, hasDuration: false, duration: new Date(), isComplete: false, start_date: new Date() },
    ];

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

export default function goal_list() {
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
      {label: 'Other', value: 'Other'}
    ]);

    const filterList = value === "All" || value === null ? currentList : currentList.filter(item => item.category === value);

    const getRemainingTime = (endDate: string) => {
      const diff = new Date(endDate).getTime() - Date.now();

      if (diff <= 0) return "Expired";

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);

      return `${hours}h ${minutes}m`;
    };
    useEffect(() => { //get goals from database,
      const fetchData = async () => {
        const { data, error } = await supabase
          .from('goals')
          .select('*');
        
        if (error) {
          console.error('Error fetching goals:', error);
        } 

        const mappedData = data?.map((goal: any) => ({
          id: goal.goal_id.toString(),
          goal: goal.title,
          description: goal.description ?? "",
          category: goal.category ?? "Other",
          newHabit: goal.is_habit ?? false,
          isMilestone: goal.is_milestone ?? false,
          milestoneType: goal.milestone_type ?? "",
          milestoneTarget: goal.milestone_target ?? null,
          start_date: goal.created_at ? new Date(goal.created_at) : new Date(),
          hasDuration: goal.duration_date != null,
          duration: goal.duration_date ? new Date(goal.duration_date) : new Date(),
          isComplete: goal.is_completed ?? false,
        }));
        // console.log(mappedData);
        //delete goals that have expired and are marked as complete, append remaining time to goals that have expired but are not marked as complete, and append remaining time to goals that have a duration
        for (const goal of mappedData || []) {
          if (goal.hasDuration) {
            const remainingTime = getRemainingTime(goal.duration.toISOString());
            if(remainingTime === "Expired" && goal.isComplete) {
              const {error} = await supabase
                  .from('goals')
                  .delete()
                  .eq('goal_id', goal.id)
  
                  if (error) {
                    console.error('Error deleting goal:', error);
                  };
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
              const {error} = await supabase
                .from('goals')
                .delete()
                .eq('goal_id', goal.id)

                if (error) {
                  console.error('Error deleting goal:', error);
                };
            }
          }  
        }

        setCurrentList(mappedData || []);
      };
      fetchData();
    },[]);

    useEffect(() => {
      if(value === "All" || value === null) {
        setVisibleList(currentList);
      } else {
        setVisibleList(filterList);
      }
    }, [value]);

  useEffect(() => {
      setVisibleList(currentList);
    }, [currentList]);
    
    const deleteItem = (id: string) => {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
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
            onPress: () => {
              if (isUuid) {
                supabase
                  .from('goals')
                  .delete()
                  .eq('goal_id', id)
                  .then(({ error }) => {
                    if (error) {
                      console.error('Error deleting goal:', error);
                    }
                  });
              }
            }
          }
        ]
      );
      setCurrentList(prev =>
        prev.filter(item => item.id !== id)
      );
    };


    const toggleComplete = async (id: string) => {
      const {error} = await supabase        
        .from('goals')
        .update({ is_completed: !currentList.find(item => item.id === id)?.isComplete })
        .eq('goal_id', id);

      setCurrentList(prev =>
        prev.map(item =>
          item.id === id ? { ...item, isComplete: !item.isComplete } : item
        )
      );
    };

    async function addCategoryGoalsToDatabase(category: Category, goal: string) {
      console.log(category, goal);
      const { data, error } = await supabase
        .from("goals")
        .insert([
          {
            title: goal.trim(),
            description: `Added from category selection: ${category}`,
            category: category,
            is_habit: false,
            is_completed: false,
          },
        ])
        .select("goal_id")
        .single();
      if (error) { 
        Alert.alert("Save failed", error.message);
        return null;
      };
      return data?.goal_id?.toString() ?? null;
    }

    return (
    <>
    <GestureHandlerRootView style={{ flex: 1, position: "relative" }}>
    <SafeAreaView style={styles.container}>

        <DropDownPicker
          open={isOpen}
          value={value}
          items={items}
          setOpen={setOpen}
          setValue={setValue}
          setItems={setItems}
          placeholder="Select category"
          disabled={openNewHabitForm}
          zIndexInverse={1000}
          zIndex={1000}
          style={{ borderColor: "#ccc", opacity: openNewHabitForm ? 0.5 : 1}}
          
        />

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
                <Pressable
                  style={{
                    width: '90%',
                    height: '80%',
                    backgroundColor: 'white',
                    borderRadius: 16,
                    padding: 16,
                  }}
                  onPress={() => {}}
                >
                  <GoalForm onSubmit={(form:GoalForm) => {
                    console.log(form);
                    setCurrentList(prev => [
                      ...prev,
                      {
                        id: Date.now().toString(), // modern & safe
                        ...form,
                        start_date: new Date(),
                      },
                    ]);
                    if (form.newHabit && form.category in OPTIONS) {
                      OPTIONS[form.category as Category].push(form.goal);
                    }
                    setOpenNewHabitForm(false);
                  }}/>
                </Pressable>
            </Pressable>
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
                          setCurrentList(prev => [
                            ...prev,
                            {
                              id: savedId,
                              goal: option,
                              description: `Added from category selection: ${selectedCategory}`,
                              category: selectedCategory,
                              newHabit: true,
                              isMilestone: false,
                              milestoneType: "",
                              milestoneTarget: null,
                              hasDuration: false,
                              duration: new Date(),
                              isComplete: false,
                              start_date: new Date(),
                            },
                          ]);
                        }}
                    >
                        <Text>{option}</Text>
                    </Pressable>
                    ))}
                </Pressable>
            </Pressable>
        </Modal>

        <Button title="Add New Habit" onPress={() => {setOpen(false);
          setOpenNewHabitForm(!openNewHabitForm);}}/>

        <View style={styles.categoryBar}>
            {Object.keys(OPTIONS).map((category) => (
                <Pressable
                    key={category}
                    onPress={() => setSelectedCategory(category as Category)}
                    style={styles.categoryButton}
                    >
                    <Text style={styles.categoryText}>{category}</Text>
                </Pressable>
            ))}
        </View>
    </SafeAreaView>
    </GestureHandlerRootView>
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
    flex: 1,
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
});
