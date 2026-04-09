import {VideoView, useVideoPlayer} from "expo-video";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback } from "react";
import { Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { updateCharityPoints } from "@/services/supabase";

export default function AdVideoScreen() {

  const { charity_name } = useLocalSearchParams<{ charity_name: string }>();

  const player = useVideoPlayer(
    Platform.select({
      ios:"https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_ts/master.m3u8",
      android:"https://samplelib.com/mp4/sample-30s.mp4",
      default:"https://samplelib.com/mp4/sample-30s.mp4",
    })!,
    (player) => {
      player.loop = true;
      player.play();
    }
  );
  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(async () => {

        async function updatePoints(){
          try{
            await updateCharityPoints(charity_name, 10); //remote database and local
          }catch(error){
            Alert.alert("Error", "There was an issue updating points. Please try again.");
          }          
        }
        await updatePoints();

        Alert.alert("Success","Successfully watched the ad and earned points. Returning to the previous screen.", 
          [{text: "OK", onPress: () => router.back() }]);

      }, 30000); // 30000ms = 30 seconds

      return () => clearTimeout(timer); // cleanup if user leaves page early
    },[])
  );

  return (
    <View style={styles.container}>
      <VideoView
        style={styles.video}
        player={player}
        contentFit="cover"
        nativeControls={false}
      />
      {/* View added as an overlay to prevent user interaction with the video, nativeControls={false} does not work on iOS */}
      <View style={[StyleSheet.absoluteFill, styles.videoOverlay]} pointerEvents="box-only"/> 
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
    zIndex:2,
  },
  skipText: {
    color: "#fff",
    fontWeight: "600",
  },
  videoOverlay:{
    zIndex:1,
  }
});
