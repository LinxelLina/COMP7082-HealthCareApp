import { ResizeMode, Video } from "expo-av";
import { StyleSheet, View } from "react-native";

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
});
