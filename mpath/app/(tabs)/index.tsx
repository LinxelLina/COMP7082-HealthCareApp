// Controls the appearance of the users status bar
import { StatusBar } from "expo-status-bar";

// useEffect to test supabase on button press
import React from "react";
import { supabase } from "@/utils/supabase";

// expo's built-in functionality for notifications
import * as Notifications from "expo-notifications";

//added platform for notifications, logbox for ignoring notification error banner XD
import { StyleSheet, Button, Text, View, Platform, LogBox, Pressable } from "react-native";
// Keeps the app from overlapping with statusbar
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from 'expo-router';
import GoalsList from '../goal_list';
import {Image} from 'expo-image';



Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

LogBox.ignoreLogs([
  "expo-notifications: Android Push notifications",
  "was removed from Expo Go",
]);


export default function HomeScreen() {
  const [isPetted, setIsPetted] = React.useState(false);

  const notify = async () => {
    const { status } = await Notifications.requestPermissionsAsync();

    if (status !== "granted") {
      console.log("Notification permission not granted");
      return;
    }

    // Android fix from chatGPT to help banners and sound
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "M-Path",
        body: "Test notification!",
        sound: "default",
      },
      trigger: null,
    });
  };

    // Test insert and select row (with a button)
  const testSupabase = async () => {
    try {
      console.log("Supabase URL:", process.env.EXPO_PUBLIC_SUPABASE_URL);

      // insert a test row (and select it)
      const { data: inserted, error: insertError } = await supabase
        .from("goals")
        .insert([
          {
            title: "Test Goal from Expo",
            description: "Lina Supabase is talking to the apppppp",
            category: "Test",
            is_habit: false,
            is_completed: false,
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.log("Insert error:", insertError);
        return;
      }

      console.log("Inserted row:", inserted);

      // select * from goals orderby created_at
      const { data: goals, error: selectError } = await supabase
        .from("goals")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (selectError) {
        console.log("Select error:", selectError);
        return;
      }

      console.log("Latest goals:", goals);
    } catch (e) {
      console.log("Unexpected error:", e);
    }
  };

  const handlePetMascot = () => {
    setIsPetted(true);
    setTimeout(() => {
      setIsPetted(false);
    }, 1000); // Reset after 2 seconds
  }

  return (
  <>
    <SafeAreaView style={styles.container}>
      <Text style={styles.appTitle}>M-Path</Text>
      {/* Start button to get to home page. May eventually add login system */}

        <View style={styles.card}>
            <View style={styles.goalsList}>
              <GoalsList showDropdownOverlay={false}/>
            </View>
        </View>
        <Pressable onPress={handlePetMascot}>
          <Image source={isPetted ? require("../../assets/images/petmascot.gif") : require("../../assets/images/mascot.gif")} style={{zIndex: 100, width:200, height:200, alignSelf: "flex-end"}}/>
        </Pressable>
        <StatusBar style="auto" />
      </SafeAreaView>
    </>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "center",
    // alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#f4f6f8",
  },
  appTitle: {
    color: "#2e7d32",
    fontSize: 34,
    fontWeight: "700",
    marginBottom: 18,
  },
  card: {
    flex: 1,
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#dfe6e9",
  },
  // sectionTitle: {
  //   color: "#2f3e46",
  //   fontSize: 26,
  //   fontWeight: "700",
  //   marginBottom: 14,
  //   textAlign: "center",
  // },
  buttonGroup: {
    width: "100%",
  },
  buttonRow: {
    marginBottom: 10,
  },
  goalsList:{
    // flex:1,
    
    height: 350,
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 4,
    borderTopEndRadius:11,
    borderTopStartRadius:11,
  }
});
