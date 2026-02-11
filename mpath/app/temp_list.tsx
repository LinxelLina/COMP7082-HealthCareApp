import { useEffect, useState } from "react";
import { Picker } from "@react-native-picker/picker";
import { View, Text, TextInput, StyleSheet, FlatList, Button, Pressable, Modal, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

    const temp_list: string[]=
    [
        "Drink more water",
        "Eat more food",
        "Feed the fish"
    ]

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
    const [currentList, setCurrentList] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [inputValue, setInputValue] = useState("");   

    useEffect(()=>{
        console.log("Data loaded");
        setCurrentList(temp_list);
    }, [])

    return (
    <>
    <SafeAreaView style={styles.container}>
        <TextInput
            style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                padding: 12,
                marginTop: 2,
                marginBottom: 2,
                backgroundColor: "white",}}
            placeholder="Add a new habit"
            returnKeyType="done"
            value={inputValue}
            onChangeText={setInputValue}
            onSubmitEditing={() => {
                const newHabit = inputValue.trim();
                if (newHabit) {
                    setCurrentList(prev => [...prev, newHabit]);
                    setInputValue("");
                }
            }}
        />
        <FlatList
            data={currentList}
            keyExtractor={(item, index) => item + index}
            renderItem={({ item }) => (
            <View style={styles.item2}>
                <Text>{item}</Text>
            </View>
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
            // onRequestClose={() => setSelectedCategory(null)}
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
                        setCurrentList(prev => [...prev, option]);
                        }}
                    >
                        <Text>{option}</Text>
                    </Pressable>
                    ))}
                </Pressable>
            </Pressable>
        </Modal>

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
