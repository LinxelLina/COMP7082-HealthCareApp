import React, { useEffect, useState } from "react";
import { Picker } from "@react-native-picker/picker";
import { View, Text, TextInput, StyleSheet, FlatList, Button, Pressable, Modal, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Checkbox } from 'expo-checkbox';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

type GoalForm = {
    goal: string;
    category: string;
    newHabit: boolean;
    duration: Date;
    isComplete: boolean;
}
export default function GoalForm() {
    const [currentList, setCurrentList] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState("");   
    const [inputHeight, setInputHeight] = useState(40);
    const [form, setForm] = useState<GoalForm>({
        goal: "",
        category: "",
        newHabit: false,
        duration: new Date(),
        isComplete: false,
    });
    const [date, setDate] = useState(new Date());
    const [mode, setMode] = useState('date');
    const [show, setShow] = useState(false);

    const onChange = (event:any, selectedDate:any) => {
      const currentDate = selectedDate;
      setShow(false);
      setDate(currentDate);
    };

    const showMode = (currentMode) => {
      setShow(true);
      setMode(currentMode);
    };

    const showDatepicker = () => {
      showMode('date');
    };

    const showTimepicker = () => {
      showMode('time');
    };
  
    const handleContentSizeChange = (event: any) => {
        const newHeight = Math.min(150, Math.max(40, event.nativeEvent.contentSize.height));
        setInputHeight(newHeight);
    };

    return (
    <>
    <SafeAreaView style={styles.container}>
        <TextInput 
            style={{
                borderWidth: 1,
                borderColor: "#ccc",
                padding: 10,
                margin: 16,
        }}
            value={form.goal}
            onChangeText={(text) => setForm({...form, goal:text})}
            placeholder="Enter goal"
        />
        <Picker selectedValue={form.category} onValueChange={(value) => setForm({...form, category:value})}>
            <Picker.Item label="Select a category" value="" />
            <Picker.Item label="Food" value="food" />
            <Picker.Item label="Fitness" value="fitness" />
            <Picker.Item label="Mental" value="mental" />
            <Picker.Item label="Social" value="social" />
            <Picker.Item label="Study" value="study" />
            <Picker.Item label="Sleep" value="sleep" />
            <Picker.Item label="Other" value="other" />
        </Picker>

        <View style={styles.section}>
          <Checkbox style={styles.checkbox} value={form.newHabit} onValueChange={(value) => setForm({...form, newHabit:value})} />
          <Text>Keep this goal in your lists?</Text>
        </View>
         <View style={styles.section}>
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode={"date"}
          is24Hour={true}
          onChange={onChange}
        />
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode={"time"}
          is24Hour={true}
          onChange={onChange}
        />
        </View>
        <Text>selected: {date.toLocaleString()}</Text>

        <Button title="Submit" onPress={() => console.log(form)} />
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
  checkbox: {
    margin: 8,
  },
    section: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
