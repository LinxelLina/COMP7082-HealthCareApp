import { addDonation } from "@/services/profile";
import { supabase } from "@/utils/supabase";
import { ResizeMode, Video } from "expo-av";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

const AD_REWARD = 10;
const AD_DURATION_MS = 5000;

export default function AdVideoScreen() {

  const { charity_id } = useLocalSearchParams<{ charity_id: string }>();
  const charityId = Number(charity_id);

  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => {
        async function updateCharityPoint(){
          const {error} = await supabase.rpc("increment_contribution", { 
            charity_id: charityId,
            contribution: AD_REWARD
          });
          if (error) {
            Alert.alert("Error", "There was an issue updating the charity points. Please try again.");
          }

          await addDonation(AD_REWARD);
          
        }
        updateCharityPoint();
        

        Alert.alert("Success","Ad watched successfully. Points were added and you will return to the previous screen.", 
          [{text: "OK", onPress: () => router.back() }]);

      }, AD_DURATION_MS);

      return () => clearTimeout(timer); // cleanup if user leaves page early
    },[])
  );

  return (
    <View style={styles.container}>
      <Video
        style={styles.video}
        // Placebholder url below sometimes errors if site is down
        source={{ uri: "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_ts/master.m3u8" }} 
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
