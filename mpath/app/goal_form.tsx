import React, { useState } from "react";
import { Picker } from "@react-native-picker/picker";
import { View, Text, TextInput, StyleSheet, Button, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Checkbox } from 'expo-checkbox';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from "@/utils/supabase";

type GoalForm = {
    goal: string;
    category: string;
    newHabit: boolean;
    hasDuration: boolean;
    duration: Date;
    isComplete: boolean;
}
type GoalFormProps = {
  onSubmit?: (form: GoalForm) => void;
};
export default function GoalForm({onSubmit = () => {}}: GoalFormProps) {
    const [form, setForm] = useState<GoalForm>({
        goal: "",
        category: "",
        newHabit: false,
        hasDuration: false,
        duration: new Date(),
        isComplete: false,
    });
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const onChange = (event:any, selectedDate:any) => {
      if (event?.type === "set" && selectedDate) {
        setDate(selectedDate);
        setForm(prev => ({ ...prev, duration: selectedDate }));
      }
      setShowDatePicker(false);
    };


    async function onSubmitHandler(){
        if (!form.goal.trim()) {
          Alert.alert("Missing goal", "Please enter a goal.");
          return;
        }
        if(form.hasDuration && !form.duration){
          Alert.alert("Missing duration", "Please select a target date.");
          return;
        }
        if(form.hasDuration && form.duration < new Date()){
          Alert.alert("Invalid duration", "Target date cannot be in the past.");
          return;
        }
        if(form.hasDuration && form.duration > new Date(Date.now() + 365*24*60*60*1000)){
          Alert.alert("Invalid duration", "Target date cannot be more than a year in the future.");
          return;
        }
        try {
          if(form.hasDuration){
          const { error } = await supabase
            .from("goals")
            .insert([
              {
                title: form.goal.trim(),
                description: `Target date: ${form.duration.toISOString()}`,
                category: form.category || "other",
                duration_date: form.duration.toISOString(),
                is_habit: form.newHabit,
                is_completed: form.isComplete,
              },
            ]);

            if (error) {
              Alert.alert("Save failed", error.message);
              return;
            }
          }else{
            const { error } = await supabase
            .from("goals")
            .insert([
              {
                title: form.goal.trim(),
                description: `Target date: ${form.duration.toISOString()}`,
                category: form.category || "other",
                is_habit: form.newHabit,
                is_completed: form.isComplete,
              },
            ]);

              if (error) {
                Alert.alert("Save failed", error.message);
                return;
              }
          }
        } catch (error: any) {
          Alert.alert("Save failed", error?.message || "Unexpected database error.");
          return;
        }

        onSubmit(form);
        Alert.alert("Saved", "Goal was added to Supabase.");
    }


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
            <Picker.Item label="Food" value="Food" />
            <Picker.Item label="Fitness" value="Fitness" />
            <Picker.Item label="Mental Health" value="Mental_Health" />
            <Picker.Item label="Social" value="Social" />
            <Picker.Item label="Study" value="Study" />
            <Picker.Item label="Sleep" value="Sleep" />
            <Picker.Item label="Other" value="Other" />
        </Picker>

        <View style={styles.section}>
          <Checkbox style={styles.checkbox} value={form.newHabit} onValueChange={(value) => setForm({...form, newHabit:value})} />
          <Text>Keep this goal in your lists?</Text>
        </View>
        <View style={styles.section}>
          <Checkbox
            style={styles.checkbox}
            value={form.hasDuration}
            onValueChange={(value) => {
              setForm({...form, hasDuration:value});
              setShowDatePicker(value);
            }}
          />
        <Text>Set target date?</Text>
        </View>
         <View style={styles.section}>
        {showDatePicker && <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode={"date"}
          is24Hour={true}
          onChange={onChange}
        />}
        </View>
        <Text>selected: {date.toLocaleString()}</Text>

        <Button title="Submit" onPress={onSubmitHandler} />
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
    zIndex: 9999,
    elevation:9999,
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
