import { updateDisableNotifications, updateNoAds } from "./profile";

// Tests that the no-ads preference is saved in the local profile database

const mockDatabase = {
  execAsync: jest.fn(),
  runAsync: jest.fn(),
  getAllAsync: jest.fn(),
};

jest.mock("expo-sqlite", () => ({
  openDatabaseAsync: jest.fn(() => Promise.resolve(mockDatabase)),
}));

describe("updateNoAds", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDatabase.getAllAsync.mockResolvedValue([
      { name: "disable_notifications" },
      { name: "no_ads" },
    ]);
    mockDatabase.execAsync.mockResolvedValue(undefined);
    mockDatabase.runAsync.mockResolvedValue(undefined);
  });

  it("stores the no-ads choice as enabled in the local profile database", async () => {
    await updateNoAds(true);

    expect(mockDatabase.runAsync).toHaveBeenCalledWith(
      "UPDATE profile SET no_ads = ?",
      1
    );
  });

  it("stores the no-ads choice as disabled in the local profile database", async () => {
    await updateNoAds(false);

    expect(mockDatabase.runAsync).toHaveBeenCalledWith(
      "UPDATE profile SET no_ads = ?",
      0
    );
  });
});

describe("updateDisableNotifications", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDatabase.getAllAsync.mockResolvedValue([
      { name: "disable_notifications" },
      { name: "no_ads" },
    ]);
    mockDatabase.execAsync.mockResolvedValue(undefined);
    mockDatabase.runAsync.mockResolvedValue(undefined);
  });

  it("stores the disable-notifications choice as enabled in the local profile database", async () => {
    await updateDisableNotifications(true);

    expect(mockDatabase.runAsync).toHaveBeenCalledWith(
      "UPDATE profile SET disable_notifications = ?",
      1
    );
  });

  it("stores the disable-notifications choice as disabled in the local profile database", async () => {
    await updateDisableNotifications(false);

    expect(mockDatabase.runAsync).toHaveBeenCalledWith(
      "UPDATE profile SET disable_notifications = ?",
      0
    );
  });
});
