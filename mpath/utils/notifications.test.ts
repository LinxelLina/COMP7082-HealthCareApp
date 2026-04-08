import * as Notifications from "expo-notifications";

import { getProfile } from "@/services/profile";
import { scheduleDailyGoalReminder } from "./notifications";

// 
jest.mock("@/services/profile", () => ({
  getProfile: jest.fn(),
}));

// Fake object designed to satisfy the type system and allow testing of notification scheduling logic without relying on actual device permissions or Expo's notification implementation.
jest.mock("expo-notifications", () => ({
  AndroidImportance: {
    MAX: "max",
  },
  SchedulableTriggerInputTypes: {
    DAILY: "daily",
  },
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
}));

const mockedGetProfile = jest.mocked(getProfile);
const mockedNotifications = jest.mocked(Notifications);

describe("scheduleDailyGoalReminder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("schedules daily reminder if notifications are allowed", async () => {
    mockedGetProfile.mockResolvedValue({
      current_charity: null,
      total_donations: 0,
      disable_notifications: 0,
      no_ads: 0,
    });
    mockedNotifications.getPermissionsAsync.mockResolvedValue({ status: "granted" } as any);
    mockedNotifications.scheduleNotificationAsync.mockResolvedValue("group4forlife" as any);

    const result = await scheduleDailyGoalReminder("Drink Water", "09:30");

    expect(result).toBe("group4forlife");
    expect(mockedNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
      content: {
        title: "M-Path Reminder",
        body: 'Time to work on "Drink Water"',
        sound: "default",
      },
      trigger: {
        type: "daily",
        hour: 9,
        minute: 30,
        channelId: "default",
      },
    });
  });

  it("returns null and does not schedule when notifications are disabled", async () => {
    mockedGetProfile.mockResolvedValue({
      current_charity: null,
      total_donations: 0,
      disable_notifications: 1,
      no_ads: 0,
    });

    const result = await scheduleDailyGoalReminder("Drink Water", "09:30");

    expect(result).toBeNull();
    expect(mockedNotifications.getPermissionsAsync).not.toHaveBeenCalled();
    expect(mockedNotifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it("does not request permission if it's already granted", async () => {
    mockedGetProfile.mockResolvedValue({
      current_charity: null,
      total_donations: 0,
      disable_notifications: 0,
      no_ads: 0,
    });
    mockedNotifications.getPermissionsAsync.mockResolvedValue({ status: "granted" } as any);
    mockedNotifications.scheduleNotificationAsync.mockResolvedValue("giveusanA" as any);

    await scheduleDailyGoalReminder("Drink Water", "09:30");

    expect(mockedNotifications.requestPermissionsAsync).not.toHaveBeenCalled();
    expect(mockedNotifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
  });

  it("returns null when permission is denied", async () => {
    mockedGetProfile.mockResolvedValue({
      current_charity: null,
      total_donations: 0,
      disable_notifications: 0,
      no_ads: 0,
    });
    mockedNotifications.getPermissionsAsync.mockResolvedValue({ status: "denied" } as any);
    mockedNotifications.requestPermissionsAsync.mockResolvedValue({ status: "denied" } as any);

    const result = await scheduleDailyGoalReminder("Drink Water", "09:30");

    expect(result).toBeNull();
    expect(mockedNotifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(mockedNotifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it("schedules after prompting and receiving perms", async () => {
    mockedGetProfile.mockResolvedValue({
      current_charity: null,
      total_donations: 0,
      disable_notifications: 0,
      no_ads: 0,
    });
    mockedNotifications.getPermissionsAsync.mockResolvedValue({ status: "undetermined" } as any);
    mockedNotifications.requestPermissionsAsync.mockResolvedValue({ status: "granted" } as any);
    mockedNotifications.scheduleNotificationAsync.mockResolvedValue("best-proj-ever" as any);

    const result = await scheduleDailyGoalReminder("Drink Water", "09:30");

    expect(result).toBe("best-proj-ever");
    expect(mockedNotifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(mockedNotifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
  });
});
