import { ResizeMode, Video } from "expo-av";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function AdVideoScreen() {
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
      <Pressable style={styles.skipButton} onPress={() => router.replace("/(tabs)")}>
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
