import {use, useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Button, Pressable, Modal, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";
import DropDownPicker from "react-native-dropdown-picker";
import { supabase } from "@/utils/supabase";
      
type Charity_Category = "Education" | "Environment" | "Animal_Welfare" | "Disaster_Relief" | "Other";

type Charity = {
    id: string;
    name: string;
    description: string;
    category: Charity_Category;
    website: string;
    contactEmail: string;
    funds: number;
};

export default function charity_list() {
    const [charityList, setCharityList] = useState<Charity[]>([]);
    const [visibleList, setVisibleList] = useState<Charity[]>([]);
    const [isOpen, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [items, setItems] = useState([
      {label: 'All', value: 'All'},
      {label: 'Education', value: 'Education'},
      {label: 'Environment', value: 'Environment'},
      {label: 'Animal Welfare', value: 'Animal_Welfare'},
      {label: 'Disaster Relief', value: 'Disaster_Relief'},
      {label: 'Other', value: 'Other'}
    ]);
    const [selectedCategory, setSelectedCategory] = useState<Charity_Category | null>(null);
    const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
    const [selected, setSelected] = useState<Charity | null>(null);

    useEffect(() => {
        async function fetchCharities() {
            const { data, error } = await supabase
            .from("charity")
            .select("*");

            console.log(data);
            if (error) {
                console.error("Error fetching charities:", error);
            } else {
                const mappedData = data?.map((charity: any) => ({
                    id: charity.id.toString(),
                    name: charity.charity_name,
                    category: charity.charity_type ?? "Other",
                    description: charity.description,
                    website: charity.website,
                    contactEmail: charity.contact_email,
                    funds: charity.contribution_total,
                }));
                console.log(mappedData);
                setCharityList(mappedData);
            }
        }

        fetchCharities();
    }, []);

    const filterList = value === "All" || value === null ? charityList : charityList.filter(item => item.category === value);

    useEffect(() => {
      if(value === "All" || value === null) {
        setVisibleList(charityList);
      } else {
        setVisibleList(filterList);
      }
    }, [value]);

    useEffect(() => {
      setVisibleList(charityList);
    }, [charityList]);

    function openForm(id : string) {
        console.log("Opening form for charity ID:", id);
        const selectedCharity = charityList.find(item => item.id === id);
        setSelected(selectedCharity ?? null);
        setIsDescriptionOpen(true);
        console.log(selected);
    }

    return(
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
          zIndexInverse={1000}
          zIndex={1000}
        />

        <FlatList
            data={visibleList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
            <Pressable onLongPress={() => {openForm(item.id)}} style={styles.charityItem}>
                <Text style={styles.charityText}>{item.name}</Text>
           </Pressable>
            )}         
            ItemSeparatorComponent={() => <View style={styles.separator2} />}   contentInsetAdjustmentBehavior="never"
            automaticallyAdjustContentInsets={false}
            contentContainerStyle={{ paddingTop: 0 }}
        />
        
        <Modal
            visible={isDescriptionOpen}
            transparent
            animationType="fade"
        >
            <Pressable
                style={styles.modalOverlay}
                onPress={() => setIsDescriptionOpen(false)}>
                    <Pressable style={styles.charityModal} 
                    onPress={()=>{}}>
                        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                            {selected && (
                                <>
                                    <Text style={styles.modalTitle}>{selected.name}</Text>

                                    <Text style={styles.modalLabel}>Category</Text>
                                    <Text>{selected.category}</Text>

                                    <Text style={styles.modalLabel}>Description</Text>
                                    <Text>{selected.description}</Text>

                                    <Text style={styles.modalLabel}>Website</Text>
                                    <Text>{selected.website}</Text>

                                    <Text style={styles.modalLabel}>Contact</Text>
                                    <Text>{selected.contactEmail}</Text>

                                    <Text style={styles.modalLabel}>Funds Raised</Text>
                                    <Text>${selected.funds}</Text>
                                </>
                            )}
                        </ScrollView>
                    </Pressable>

            </Pressable>
        </Modal>

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
                </Pressable>
            </Pressable>
        </Modal>
    </SafeAreaView>
    </GestureHandlerRootView>
        </>
    );
};

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
    // height: 1,
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
    fontSize: 30,
    fontWeight: "600",
    marginBottom: 12,
  },
  option: {
    paddingVertical: 12,
  },
  charityItem: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginVertical: 6,
    borderRadius: 8,
    backgroundColor: 'white'
  },
  charityText: {
    fontSize: 20,
    fontWeight: '600'
  },
  charityModal: {
  width: "90%",
  height: "50%",
  backgroundColor: "white",
  padding: 20,
  borderRadius: 16,
  alignSelf: "center",
  marginTop: "40%",
},

modalLabel: {
  marginTop: 10,
  fontWeight: "600",
  color: "#555",
  fontSize:18,
},
});
