// Controls the appearance of the users status bar
import { StatusBar } from "expo-status-bar";

// useEffect to test supabase on button press
import React from "react";
import { supabase } from "@/utils/supabase";

// expo's built-in functionality for notifications
import * as Notifications from "expo-notifications";

//added platform for notifications, logbox for ignoring notification error banner XD
import { StyleSheet, Button, Text, View, Platform, LogBox } from "react-native";
// Keeps the app from overlapping with statusbar
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from 'expo-router';



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


  return (
    // <ParallaxScrollView
    //   headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
    //   headerImage={
    //     <Image
    //       source={require('@/assets/images/partial-react-logo.png')}
    //       style={styles.reactLogo}
    //     />
    //   }>
    //   <ThemedView style={styles.titleContainer}>
    //     <ThemedText type="title">Welcome!</ThemedText>
    //     <HelloWave />
    //   </ThemedView>
    //   <ThemedView style={styles.stepContainer}>
    //     <ThemedText type="subtitle">Step 1: Try it</ThemedText>
    //     <ThemedText>
    //       Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
    //       Press{' '}
    //       <ThemedText type="defaultSemiBold">
    //         {Platform.select({
    //           ios: 'cmd + d',
    //           android: 'cmd + m',
    //           web: 'F12',
    //         })}
    //       </ThemedText>{' '}
    //       to open developer tools.
    //     </ThemedText>
    //   </ThemedView>
    //   <ThemedView style={styles.stepContainer}>
    //     <Link href="/modal">
    //       <Link.Trigger>
    //         <ThemedText type="subtitle">Step 2: Explore</ThemedText>
    //       </Link.Trigger>
    //       <Link.Preview />
    //       <Link.Menu>
    //         <Link.MenuAction title="Action" icon="cube" onPress={() => alert('Action pressed')} />
    //         <Link.MenuAction
    //           title="Share"
    //           icon="square.and.arrow.up"
    //           onPress={() => alert('Share pressed')}
    //         />
    //         <Link.Menu title="More" icon="ellipsis">
    //           <Link.MenuAction
    //             title="Delete"
    //             icon="trash"
    //             destructive
    //             onPress={() => alert('Delete pressed')}
    //           />
    //         </Link.Menu>
    //       </Link.Menu>
    //     </Link>

    //     <ThemedText>
    //       {`Tap the Explore tab to learn more about what's included in this starter app.`}
    //     </ThemedText>
    //   </ThemedView>
    //   <ThemedView style={styles.stepContainer}>
    //     <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
    //     <ThemedText>
    //       {`When you're ready, run `}
    //       <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
    //       <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
    //       <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
    //       <ThemedText type="defaultSemiBold">app-example</ThemedText>.
    //     </ThemedText>
    //   </ThemedView>
    // </ParallaxScrollView>
        // "View" is basically HTML <div>
  <>
    <SafeAreaView style={styles.container}>
      <Text style={styles.appTitle}>M-Path</Text>
      {/* Start button to get to home page. May eventually add login system */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Home</Text>
          <View style={styles.buttonGroup}>
            <View style={styles.buttonRow}>
              <Button color="#2e7d32" title="List" onPress={() => router.push("/goal_list")} />
            </View>
            <View style={styles.buttonRow}>
              <Button color="#2e7d32" title="Charity Form" onPress={() => router.push("/charity_form")} />
            </View>
            <View style={styles.buttonRow}>
              <Button color="#2e7d32" title="Go to Profile" onPress={() => router.push("/profile")} />
            </View>

            <View style={styles.buttonRow}>
              <Button color="#2e7d32" title="Charity List" onPress={() => router.push("/charity_list")} />
            </View>
            <View style={styles.buttonRow}>
              <Button color="#2e7d32" title="Charity Graph" onPress={() => router.push("/charity_graph")} />
            </View>
          </View>
        </View>
        <StatusBar style="auto" />
      </SafeAreaView>
    </>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#dfe6e9",
  },
  sectionTitle: {
    color: "#2f3e46",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 14,
    textAlign: "center",
  },
  buttonGroup: {
    width: "100%",
  },
  buttonRow: {
    marginBottom: 10,
  },
});
