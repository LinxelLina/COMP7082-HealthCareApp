import { getProfile, updateCharity, updateDisableNotifications, updateNoAds } from "@/services/profile";
import { supabase } from "@/utils/supabase";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, Switch, Text, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { SafeAreaView } from "react-native-safe-area-context";

type Charity = {
    value: number;
    label: string;
}

type ProfileRecord = {
  current_charity: string | null;
  total_donations: number;
  disable_notifications: number;
  no_ads: number;
};


export default function Profile() {
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [currentCharity, setCurrentCharity] = useState<Charity | null>(null);
  const [isOpen, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState<Charity[]>([]);
  const [disableNotifications, setDisableNotifications] = useState(false);
  const [noAds, setNoAds] = useState(false);

  function applyProfileData(profileData: ProfileRecord | null) {
    setProfile(profileData);
    setDisableNotifications(Boolean(profileData?.disable_notifications));
    setNoAds(Boolean(profileData?.no_ads));
  }

  useFocusEffect(
    useCallback(() => {
      async function refreshProfile() {
        const profileData = await getProfile();
        applyProfileData(profileData);
      }
      refreshProfile();
    }, [])
  );
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
        applyProfileData(profileData);

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

  async function handleDisableNotificationsChange(value: boolean) {
    // True is disabled notifications (after setting has changed)
    setDisableNotifications(value);
    await updateDisableNotifications(value);
  }

  async function handleNoAdsChange(value: boolean) {
    // True means no ads for the user.
    setNoAds(value);
    await updateNoAds(value);
  }

  function handleAdVideoPress() {
    // Skip the ad video when the user has chosen the no-ads option.
    if (noAds) {
      Alert.alert("No ads for you: we respect your choice.");
      return;
    }

    router.push({ pathname: "/ad_video", params: { charity_id: String(value) } });
  }


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

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 8 }}>
        <Text>Disable notifications</Text>
        <Switch value={disableNotifications} onValueChange={handleDisableNotificationsChange} />
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 8 }}>
        <Text>No ads</Text>
        <Switch value={noAds} onValueChange={handleNoAdsChange} />
      </View>

      <Pressable onPress={handleAdVideoPress}>
        <Text>Test Ad-Video</Text>
      </Pressable>

      <Text>Current Contributions Overall: {profile?.total_donations ?? 0}</Text>
    </SafeAreaView>
  );
}
