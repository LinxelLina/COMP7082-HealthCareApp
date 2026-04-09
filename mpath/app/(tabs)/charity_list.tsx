import {useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, Modal, Alert} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DropDownPicker from "react-native-dropdown-picker";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import { Charity_Category, Charity, CHARITYCATEGORYNAMES } from "@/types/charity";
import { fetchCharities } from "@/services/supabase";
import {ScrollView} from "react-native-gesture-handler";

export default function CharityList() {
    const [charityList, setCharityList] = useState<Charity[]>([]);
    const [visibleList, setVisibleList] = useState<Charity[]>([]);
    const [isOpen, setOpen] = useState(false);
    const [value, setValue] = useState<string | null>(null);
    const [items, setItems] = useState([
      {label: 'All', value: 'All'},
      {label: 'Education', value: 'Education'},
      {label: 'Medical', value: 'Medical'},
      {label: 'Environment', value: 'Environment'},
      {label: 'Animal Welfare', value: 'Animal_Welfare'},
      {label: 'Disaster Relief', value: 'Disaster_Relief'},
      {label: 'Other', value: 'Other'}
    ]);
    const [selectedCategory, setSelectedCategory] = useState<Charity_Category | null>(null);
    const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
    const [selected, setSelected] = useState<Charity | null>(null);

    async function openLink(url: string) {
      try {
        const formattedUrl = url.startsWith("http") ? url : `https://${url}`;
        await WebBrowser.openBrowserAsync(formattedUrl);

      } catch (error: any) {
        Alert.alert(error.message)
      }
    }

    useEffect(() => {
        async function getCharities() {
          try{
            const charities = await fetchCharities()
            setCharityList(charities);
          }catch (error: any){
            Alert.alert("Error","Could not load charities. Please try again.");
          }
        }

        getCharities();
    }, []);

    // const filterList = value === "All" || value === null ? charityList : charityList.filter(item => item.category === value);

    // useEffect(() => {
    //   if(value === "All" || value === null) {
    //     setVisibleList(charityList);
    //   } else {
    //     setVisibleList(filterList);
    //   }
    // }, [value]);

    // useEffect(() => {
    //   setVisibleList(charityList);
    // }, [charityList]);

    useEffect(() => {
      let filtered = charityList;
      if (value && value !== "All") {
        filtered = charityList.filter(item => item.category === value);
      }
      setVisibleList(filtered);
    }, [charityList, value]);

    function openForm(id : string) {
        const selectedCharity = charityList.find(item => item.id === id);
        setSelected(selectedCharity ?? null);
        setIsDescriptionOpen(true);
    }

    return(
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
          style={{ borderColor: "#ccc"}}
        />

        <FlatList
            data={visibleList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable onLongPress={() => {openForm(item.id)}} style={styles.charityItem}>
                <View style={styles.rowContent}>
                <View style={styles.categoryColumn}>
                <View style={styles.categoryPill}>
                  <Text style={styles.categoryText}>{CHARITYCATEGORYNAMES[item.category as Charity_Category]}</Text>
                  </View>
                  </View>
                  <Text style={styles.charityText}>{item.name}</Text>
                  </View>


              </Pressable>
            )}         
            ItemSeparatorComponent={() => <View style={styles.separator2} />}   contentInsetAdjustmentBehavior="never"
            automaticallyAdjustContentInsets={false}
            contentContainerStyle={{ paddingTop: 0 }}
            style={styles.content}
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

                                    <Pressable onPress={() => openLink(selected.website)}>
                                      <Text style={{color: "blue", textDecorationLine: "underline", fontSize: 25}}>Visit Website</Text>
                                    </Pressable>
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

        <Pressable onPress={() => router.push("../charity_graph")}
          style={styles.charityGraphButton}>
          <Text style={styles.charityGraphText}>Go to Charity Graph</Text>
        </Pressable>

        <Pressable onPress={() => router.push("../charity_form")}
          style={styles.charityFormButton}>
          <Text style={styles.charityFormText}>Go to Charity Form</Text>
        </Pressable>
    </SafeAreaView>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  separator2: {
    backgroundColor: "#ddd",
    marginHorizontal: 16,
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
  categoryText: {
    color: "#2e7d32",
    fontSize: 12,
    fontWeight: "700",
  },
  categoryPill: {
    backgroundColor: "#eef6ef",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  categoryColumn: {
    width: 100,
    marginRight: 10,
  },
  rowContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  content:{
    paddingHorizontal: 8,
  },
  charityGraphButton:{
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
  charityGraphText:{
    color: "#1a56db",
    fontWeight: "600",
    fontSize: 16,
  },
  charityFormButton:{
    backgroundColor: "#fef3e8",
    borderWidth: 1,
    borderColor: "#f8c8a8",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 8,
  },
  charityFormText: {
    color: "#b45309",
    fontWeight: "600",
    fontSize: 16,
  },
});
