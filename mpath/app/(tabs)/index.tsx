import { StatusBar } from "expo-status-bar";
import React from "react";
import { supabase } from "@/utils/supabase";
import * as Notifications from "expo-notifications";
import { StyleSheet, Button, Text, View, Platform, LogBox, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GoalsList from '../goal_list';
import {Image} from 'expo-image';
import { LinearGradient } from "expo-linear-gradient";

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

  const handlePetMascot = () => {
    setIsPetted(true);
    setTimeout(() => {
      setIsPetted(false);
    }, 1000); // Reset after 2 seconds
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Text style={styles.appTitle}>M-Path</Text>

      <View style={styles.card}>
          <View style={styles.goalsList}>
            <GoalsList showDropdownOverlay={false}/>
          </View>
      </View>

    <LinearGradient
      colors={["#ffffff", "#056e0a"]}  // start color to end color
      style={{ height: 200, width: "100%" }}  // only covers this portion
    >
      <Pressable onPress={handlePetMascot}>
        <Image source={isPetted ? require("../../assets/images/petmascot.gif") : require("../../assets/images/mascot.gif")} style={styles.mascot}/>
      </Pressable>
    </LinearGradient>

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingHorizontal: 10,
    backgroundColor: "#ffffff",
  },
  appTitle: {
    textAlign: "center",
    color: "#2e7d32",
    fontSize: 60,
    fontWeight: "700",
    marginBottom: 18,
  },
  card: {
    flex: 1,
    width: "100%",
    backgroundColor: "#ffffff",
    padding: 5,
  },
  goalsList:{
    height: 350,
    borderWidth: 2,
    borderColor: '#012503',
    borderRadius: 4,
    borderTopEndRadius:11,
    borderTopStartRadius:11,
  },
  mascot:{
    zIndex: 100, 
    width:200, 
    height:200, 
    alignSelf: "flex-end",
  }
});
