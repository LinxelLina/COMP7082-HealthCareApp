import { ResizeMode, Video } from "expo-av";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { supabase } from "@/utils/supabase";
import { addDonation } from "@/services/profile";

export default function AdVideoScreen() {

  const { charity_id } = useLocalSearchParams<{ charity_id: string }>();
  const charityId = Number(charity_id);

  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => {
        async function updateCharityPoint(){
          const {error} = await supabase.rpc("increment_contribution", { 
            charity_id: charityId,
            contribution: 10  // ← pass whatever value you want here
          });
          if (error) {
            Alert.alert("Error", "There was an issue updating the charity points. Please try again.");
          }

          await addDonation(10);
          
        }
        updateCharityPoint();
        

        Alert.alert("Success","Successfully watched the ad and earned points. Returning to the previous screen.", 
          [{text: "OK", onPress: () => router.back() }]);

      }, 5000); // 30000ms = 30 seconds

      return () => clearTimeout(timer); // cleanup if user leaves page early
    },[])
  );

  return (
    <View style={styles.container}>
      <Video
        style={styles.video}
        source={{ uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" }}
        useNativeControls
        resizeMode={ResizeMode.COVER}
        isLooping
        shouldPlay
      />
      <Pressable style={styles.skipButton} onPress={() => router.back()}>
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  video: {
    flex: 1,
  },
  skipButton: {
    position: "absolute",
    top: 48,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  skipText: {
    color: "#fff",
    fontWeight: "600",
  },
});
