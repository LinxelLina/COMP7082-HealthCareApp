import { addDonation } from "./profile";
import { updateCharityPoint } from "./supabase";

// Tests coordinating local db if SUpabase fails

const mockRpc = jest.fn();

jest.mock("@/utils/supabase", () => ({
  supabase: {
    rpc: (...args: any[]) => mockRpc(...args),
  },
}));

jest.mock("./profile", () => ({
  addDonation: jest.fn(),
}));

const mockedAddDonation = jest.mocked(addDonation);

describe("updateCharityPoint", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("does not add a local donation when Supabase update fails", async () => {
    mockRpc.mockResolvedValue({
      error: { message: "RPC failed" },
    });

    await expect(updateCharityPoint("Test Charity")).rejects.toThrow("RPC failed");

    expect(mockRpc).toHaveBeenCalledWith("increment_contribution_by_name", {
      charity_name: "Test Charity",
      contribution: 1,
    });
    expect(mockedAddDonation).not.toHaveBeenCalled();
  });

  it("adds a local donation when the Supabase update succeeds", async () => {
    mockRpc.mockResolvedValue({
      error: null,
    });

    await updateCharityPoint("Test Charity");

    expect(mockRpc).toHaveBeenCalledWith("increment_contribution_by_name", {
      charity_name: "Test Charity",
      contribution: 1,
    });
    expect(mockedAddDonation).toHaveBeenCalledWith(1);
  });
});
