import { useEffect, useState } from "react";
import { View, Text, TextInput } from "react-native";

    const temp_list: string[]=
    [
        "Drink more water",
        "Eat more food",
        "Feed the fish"
    ]

export default function Temp_List() {
    const [currentList, setCurrentList] = useState<string[]>([]);
    const [addGoal, setAddGoal] = useState("");

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

    return (
    <>
    <View>
        {currentList?.map((point, index)=>(
            <Text   
            key = {index}
            style={{
                color: "green",
                fontSize: 32,
                fontWeight: "bold",
                }}>
                {point}
            </Text>
            ))}

        <TextInput placeholder="Enter Goal"
            value={addGoal}
            onChangeText={setAddGoal}
            onSubmitEditing={addToList}
            returnKeyType="done"/>
    </View>
    </>
    );
}
