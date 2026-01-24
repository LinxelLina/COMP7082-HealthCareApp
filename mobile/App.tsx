// Controls the appearance of the users status bar
import { StatusBar } from "expo-status-bar";
import { Text } from "react-native";
// Keeps the app from overlapping with statusbar
import { SafeAreaView } from "react-native-safe-area-context";

// Main entrypoint for app, "export" because index.ts uses this for expo
export default function App() {
  return (
    // "View" is basically HTML <div>
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          color: "green",
          fontSize: 32,
          fontWeight: "bold",
        }}
      >
        M-Path
      </Text>

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}


