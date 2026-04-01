import { useEffect, useState } from "react";
import { Picker } from "@react-native-picker/picker";
import { View, Text, TextInput, StyleSheet, FlatList, Button, Pressable, Modal, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/utils/supabase";

type CharityForm = {
    name: string;
    type: string;
    description: string;
    website: string;
    contactEmail: string;
}
export default function CharityForm() {
    const [currentList, setCurrentList] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState("");   
    const [inputHeight, setInputHeight] = useState(40);
    const [form, setForm] = useState({
        name: "",
        type: "",
        description: "",
        website: "",
        contactEmail: "",
    });

    const handleContentSizeChange = (event: any) => {
        const newHeight = Math.min(150, Math.max(40, event.nativeEvent.contentSize.height));
        setInputHeight(newHeight);
    };

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

          console.log("Form submitted:", form);

          const {error} = await supabase.from("charity").insert([
            {
              created_at: new Date().toISOString(),
              charity_name: form.name,
              charity_type: form.type,
              description: form.description,
              website: form.website,
              contact_email: form.contactEmail,
              contribution_total: 0,
            }
          ]);
          if(error){
            alert("Error submitting form: " + error.message);
            return;
          }
          alert("Charity submitted successfully!");
          setForm({
            name: "",
            type: "",
            description: "",
            website: "",
            contactEmail: "",
          });
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
            style={{
                borderWidth: 1,
                borderColor: "#ccc",
                padding: 10,
                margin: 16,
                height: inputHeight
            }}
            value={form.description}
            onChangeText={(text) => setForm({...form, description:text})}
            placeholder="Enter charity description"
            onContentSizeChange={handleContentSizeChange}
            multiline={true}
            underlineColorAndroid="transparent"
        />

        <TextInput 
            style={{
                borderWidth: 1,
                borderColor: "#ccc",
                padding: 10,
                marginHorizontal: 16,
        }}
            value={form.website}
            onChangeText={(text) => setForm({...form, website:text})}
            placeholder="Enter charity website"
        />
        <TextInput 
            style={{
                borderWidth: 1,
                borderColor: "#ccc",
                padding: 10,
                marginHorizontal: 16,
                marginTop: 4,
        }}
            value={form.contactEmail}
            onChangeText={(text) => setForm({...form, contactEmail:text})}
            placeholder="Enter contact email"
        />

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
