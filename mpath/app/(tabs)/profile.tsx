import { getProfile, updateCharity, updateDisableNotifications, updateNoAds } from "@/services/profile";
import { supabase } from "@/utils/supabase";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Switch, Text, View } from "react-native";
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
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Your Profile</Text>
        <Text style={styles.subtitle}>Manage your charity and app settings.</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Charity</Text>
          <Text style={styles.cardText}>
            Current charity: {currentCharity?.label ?? "No charity selected"}
          </Text>
          <DropDownPicker
            open={isOpen}
            value={value}
            items={items}
            setOpen={setOpen}
            setValue={setValue}
            setItems={setItems}
            placeholder="Choose a charity"
            zIndexInverse={1000}
            zIndex={1000}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownList}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Settings</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingTextBlock}>
              <Text style={styles.settingTitle}>Disable notifications</Text>
              <Text style={styles.settingDescription}>Turn off future app reminders.</Text>
            </View>
            <Switch value={disableNotifications} onValueChange={handleDisableNotificationsChange} />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingTextBlock}>
              <Text style={styles.settingTitle}>No ads</Text>
              <Text style={styles.settingDescription}>Skip the ad video in the app.</Text>
            </View>
            <Switch value={noAds} onValueChange={handleNoAdsChange} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Impact</Text>
          <Text style={styles.pointsText}>
            Current contributions overall: {profile?.total_donations ?? 0}
          </Text>

          <Pressable style={styles.actionButton} onPress={handleAdVideoPress}>
            <Text style={styles.actionButtonText}>Test Ad-Video</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f8",
  },
  content: {
    padding: 16,
  },
  title: {
    color: "#2f3e46",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    color: "#5e6b61",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dfe6e9",
    padding: 14,
    marginBottom: 12,
  },
  cardTitle: {
    color: "#2f3e46",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 8,
  },
  cardText: {
    color: "#2f3e46",
    fontSize: 15,
    marginBottom: 10,
  },
  dropdown: {
    borderColor: "#cfe0d1",
    borderRadius: 14,
    backgroundColor: "#fbfdfb",
  },
  dropdownList: {
    borderColor: "#cfe0d1",
    borderRadius: 14,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f7faf7",
    borderWidth: 1,
    borderColor: "#dce8dd",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 8,
  },
  settingTextBlock: {
    flex: 1,
    paddingRight: 12,
  },
  settingTitle: {
    color: "#2f3e46",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  settingDescription: {
    color: "#6d7d70",
    fontSize: 13,
  },
  pointsText: {
    color: "#2f3e46",
    fontSize: 15,
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: "#2e7d32",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
