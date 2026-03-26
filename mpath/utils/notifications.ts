import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

export async function initializeNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync("default", {
    name: "default",
    importance: Notifications.AndroidImportance.MAX,
    sound: "default",
  });
}

export async function requestNotificationPermission() {
  const existingPermissions = await Notifications.getPermissionsAsync();

  if (existingPermissions.status === "granted") {
    return true;
  }

  const requestedPermissions = await Notifications.requestPermissionsAsync();
  return requestedPermissions.status === "granted";
}

export async function scheduleDailyGoalReminder(goalTitle: string, reminderTime: string) {
  const hasPermission = await requestNotificationPermission();

  if (!hasPermission) {
    return null;
  }

  await initializeNotifications();

  const [hourText, minuteText] = reminderTime.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);

  return Notifications.scheduleNotificationAsync({
    content: {
      title: "M-Path Reminder",
      body: `Time to work on "${goalTitle}"`,
      sound: "default",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: "default",
    },
  });
}

export async function cancelScheduledReminder(notificationId: string) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
