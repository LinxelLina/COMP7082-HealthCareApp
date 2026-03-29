import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { initGoalsDatabase } from '@/services/goals';
import { initializeNotifications } from '@/utils/notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    initGoalsDatabase().catch((error) => {
      console.error("Error initializing goals database:", error);
    });

    initializeNotifications().catch((error) => {
      console.error("Error initializing notifications:", error);
    });
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{headerBackTitle: "Back"}}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        {/* <Stack.Screen name="index" options={{title: "Home"}} /> */}
        <Stack.Screen name="profile" options={{title: "Profile"}} />
        <Stack.Screen name="goal_page" options={{title: "Goal Page"}} />
        <Stack.Screen name="charity_form" options={{title: "Charity Form"}} />
        <Stack.Screen name="charity_list" options={{title: "Charity List"}} />
        <Stack.Screen name="charity_graph" options={{title: "Charity Graph"}}/>
        <Stack.Screen name="goal_form" options={{title: "Goal Form"}} />
        <Stack.Screen name="goal_detail" options={{ title: "Goal Detail" }} />
        <Stack.Screen name="ad_video" options={{ title: "Ad Video" }} />
      </Stack>
      <StatusBar style="auto" />
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
