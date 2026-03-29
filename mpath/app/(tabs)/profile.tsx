import { getCharity, getProfile, updateCharity } from "@/services/profile";
import { supabase } from "@/utils/supabase";
import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { SafeAreaView } from "react-native-safe-area-context";

type Charity = {
    value: number;
    label: string;
}

export default function Profile() {
  const [currentCharity, setCurrentCharity] = useState<Charity | null>(null);
  const [isOpen, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState<Charity[]>([]);

  useEffect(() => { //set up the page by fetching charity list and profile data
    async function initialize() {
      try {
        const {data, error} = await supabase
        .from("charity")
        .select('id, charity_name');

        if (error) {
          console.error("Error fetching charities:", error);
          return;
        }

        const charityList = data?.map((charity) => ({
          value: charity.id,
          label: charity.charity_name,
        })) ?? [];

        setItems(charityList);

        const profileData = await getProfile();
        if(profileData?.current_charity) {
          const match = charityList.find((c) => c.label === profileData.current_charity);
          if (match) {
            setCurrentCharity(match);
            setValue(match.value); 
          }
        }
      } catch (error) {
        console.error("Error fetching charity data:", error);
      }
    }
    initialize();
  }, []);

  useEffect(() => {
    async function updateCurrentCharity() {
      if (value === null) return; //if no charity selected, do nothing

      try {
        const selectedCharity = items.find((item) => item.value === value);
        if (!selectedCharity) {
          console.error("Selected charity not found in items list");
          return;
        }

        await updateCharity(selectedCharity.value, selectedCharity.label);
        setCurrentCharity(selectedCharity); 

        
      }catch (error) {
        console.error("Error updating profile data:", error);
      }
    };
    setCurrentCharity(value); //update displayed current charity immediately
    updateCurrentCharity(); 
  }, [value]);


  return (
    <SafeAreaView>
      <Text>Profile Screen</Text>
      <Text>Current Charity: {currentCharity?.label ?? "No charity selected"}</Text>
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
    </SafeAreaView>
  );
}
