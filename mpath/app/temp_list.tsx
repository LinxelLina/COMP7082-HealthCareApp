import {useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Button, Pressable, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import  SwipeRow from "./swipableComponent";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import GoalForm from "./goal_form";
import DropDownPicker from "react-native-dropdown-picker";

    type Habit = {
      id: string;
      goal: string;
      category: string;
      newHabit: boolean;
      duration: Date;
      isComplete: boolean;
    };

    type GoalForm = {
      goal: string;
      category: string;
      newHabit: boolean;
      duration: Date;
      isComplete: boolean;
    }
    
    const temp_list: Habit[]=
    [
      { id: "1", goal: "Drink more water", category: "Food", newHabit: true, duration: new Date(), isComplete: false },
      { id: "2", goal: "Eat more food", category: "Food", newHabit: true, duration: new Date(), isComplete: false },
      { id: "3", goal: "Feed the fish", category: "Other", newHabit: true, duration: new Date(), isComplete: false },
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

export default function Temp_List() {
    const [currentList, setCurrentList] = useState<Habit[]>(temp_list);
    const [visibleList, setVisibleList] = useState<Habit[]>(temp_list);
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
      setCurrentList(prev =>
        prev.filter(item => item.id !== id)
      );
    };


    const toggleComplete = (id: string) => {
      setCurrentList(prev =>
        prev.map(item =>
          item.id === id ? { ...item, isComplete: !item.isComplete } : item
        )
      );
    };

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
                      },
                    ]);
                    if(form.newHabit) {
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
              <Pressable onLongPress={() => toggleComplete(item.id)}>
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
                        onPress={() => {
                        setCurrentList(prev => [
                          ...prev,
                          {
                            id: Date.now().toString(), //temporary id generation, will change to something more robust later maybe when implementing database
                            goal: option,
                            newHabit: true,
                            duration: new Date(),
                            isComplete: false,
                            category: selectedCategory,
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
