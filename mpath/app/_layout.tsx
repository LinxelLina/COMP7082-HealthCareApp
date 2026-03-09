import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="index" options={{title: "Home"}} />
        <Stack.Screen name="profile" options={{title: "Profile"}} />
        <Stack.Screen name="goal_list" options={{title: "Goal List"}} />
        <Stack.Screen name="charity_form" options={{title: "Charity Form"}} />
        <Stack.Screen name="charity_list" options={{title: "Charity List"}} />
        <Stack.Screen name="charity_graph" options={{title: "Charity Graph"}}/>
        <Stack.Screen name="goal_form" options={{title: "Goal Form"}} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
