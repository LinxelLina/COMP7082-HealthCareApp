import { useState } from "react";
import { Picker } from "@react-native-picker/picker";
import {TextInput, StyleSheet, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CharityFormFields } from "@/types/charity";
import { addNewCharity } from "@/services/supabase";
import { router } from "expo-router";

export default function CharityForm() {  
    const [form, setForm] = useState<CharityFormFields>({
        name: "",
        type: "",
        description: "",
        website: "",
        contactEmail: "",
    });

    const onSubmitHandler = async () => {
        // Validate form fields
        if (!form.name.trim()) {
            alert("Please enter a charity name.");
            return;
        }
        if (!form.type) {
            alert("Please select a charity type.");
            return;
        }
        if (!form.description.trim()) {
            alert("Please enter a charity description.");
            return;
        }
        if (form.website && !/^https?:\/\/\S+$/.test(form.website)) {
            alert("Please enter a valid website URL.");
            return;
        }
        if (form.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) {
            alert("Please enter a valid email address.");
            return;
        }
          // Submit form data to backend or perform desired action
        try{
          const addToCharity:boolean = await addNewCharity(form);
          if(!addToCharity){
            alert("Charity was not submitted successfully. Please try again.")
            return;
          }

          // Charity list does not update after adding, app refresh required, not going to add refresh functionality to simulate an application process.
          alert("Charity submitted successfully! Awaiting approval.");

          setForm({
            name: "",
            type: "",
            description: "",
            website: "",
            contactEmail: "",
          });

          router.back();
        }catch(error){
          alert("Something went wrong. Please try again.")
        }
        
      }

    return (
    <>
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <SafeAreaView>
              <TextInput 
                  style={styles.textBox}
                  value={form.name}
                  onChangeText={(text) => setForm({...form, name:text})}
                  placeholder="Enter charity name"
              />
              <Picker selectedValue={form.type} onValueChange={(value) => setForm({...form, type:value})}>
                  <Picker.Item label="Select a type" value="" />
                  <Picker.Item label="Medical" value="Medical" />
                  <Picker.Item label="Education" value="Education" />
                  <Picker.Item label="Environment" value="Environment" />
                  <Picker.Item label="Animal Welfare" value="Animal_Welfare" />
                  <Picker.Item label="Disaster Relief" value="Disaster_Relief" />
                  <Picker.Item label="Other" value="Other" />
              </Picker>

              <TextInput
                  style={styles.multiLineTextBox}
                  value={form.description}
                  onChangeText={(text) => setForm({...form, description:text})}
                  placeholder="Enter charity description"
                  multiline={true}
                  underlineColorAndroid="transparent"
              />

              <TextInput 
                  style={styles.textBox}
                  value={form.website}
                  onChangeText={(text) => setForm({...form, website:text})}
                  placeholder="Enter charity website"
              />
              <TextInput 
                  style={styles.textBox}
                  value={form.contactEmail}
                  onChangeText={(text) => setForm({...form, contactEmail:text})}
                  placeholder="Enter contact email"
              />

              <Pressable onPress={onSubmitHandler} style={styles.submitButton}>
                <Text style={styles.submitButtonText}>Submit</Text>
              </Pressable>
          </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
    </>
    );  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  textBox:{
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginHorizontal: 16,
    margin:5,
  },
  multiLineTextBox:{
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginHorizontal: 16,
    margin:5, 
    height:100,
  },
  submitButton:{
    backgroundColor: "#e8f0fe",
    borderWidth: 1,
    borderColor: "#a8c0f8",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 8,
  },
  submitButtonText:{
    color: "#1a56db",
    fontWeight: "600",
    fontSize: 16,
  },
});
