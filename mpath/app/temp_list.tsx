import { useEffect, useState } from "react";
import { Picker } from "@react-native-picker/picker";
import { View, Text, TextInput, StyleSheet, FlatList, Button } from "react-native";

    const temp_list: string[]=
    [
        "Drink more water",
        "Eat more food",
        "Feed the fish"
    ]

    type TempListProps = {
        category: string;
        goal: string;
    };

export default function Temp_List() {
    const [currentList, setCurrentList] = useState<string[]>([]);
    const [addGoal, setAddGoal] = useState("");

    const [selectedCategory, setSelectedCategory] = useState("Food/Drink");
    const [items, setItems] = useState<TempListProps[]>([]);

    useEffect(()=>{
        console.log("Data loaded");
        setCurrentList(temp_list);
    }, [])

    useEffect(()=>{
        //Need to fix this issue, but when rendering the initial setCurrentList(temp_list) it would cause this useEffect to activate and clear it
        //Currently works like this, but need to take into account what happens if there's an empty list to start
        //TO-DO: Fix this.
        if(!(currentList.length <= 0)){
            setCurrentList(currentList);
        }
        
    },[currentList])

    function addToList(){
        console.log(addGoal);
        setCurrentList(prevList =>[...prevList, addGoal]);
    }

    const addItem = () => {
    setItems(prev => [
        ...prev,
        {
        category: selectedCategory,
        goal: addGoal,
        },
    ]);
    };

    
    return (
    <>
    <View>
        <FlatList
            data={currentList}
            keyExtractor={(item) => item}
            renderItem={({ item, index }) => (
                <Text key={index} style={styles.item}>{item}</Text>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
        />

        {/* {currentList?.map((point, index)=>(
            <Text   
            key = {index}
            // style={styles{
            //     color: "green",
            //     fontSize: 32,
            //     fontWeight: "bold",
                // }}
                >
                {point}
            </Text>
            ))} */}

        <TextInput placeholder="Enter Goal"
            value={addGoal}
            onChangeText={setAddGoal}
            onSubmitEditing={addToList}
            returnKeyType="done"/>

              {/* Select Menu */}
            <Picker
                selectedValue={selectedCategory}
                onValueChange={(value) => setSelectedCategory(value)}
                style={styles.picker}
            >
                <Picker.Item label="Fruit" value="Fruit" />
                <Picker.Item label="Vegetables" value="Vegetables" />
                <Picker.Item label="Dairy" value="Dairy" />
                <Picker.Item label="Meat" value="Meat" />
            </Picker>

            <Button title="Add to list" onPress={addItem} />

            {/* List */}
            <FlatList
                data={items}
                keyExtractor={(item) => item.goal}
                renderItem={({ item }) => (
                <View style={styles.item2}>
                    <Text>{item.goal}</Text>
                </View>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator2} />}
                style={styles.list}
            />
    </View>
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
    paddingTop: 50,
  },
  picker: {
    marginHorizontal: 16,
  },
  list: {
    marginTop: 20,
  },
  item2: {
    padding: 16,
  },
  separator2: {
    height: 1,
    backgroundColor: "#ddd",
    marginHorizontal: 16,
  },
});
