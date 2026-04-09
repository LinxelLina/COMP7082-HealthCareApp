import { addDonation } from "./profile";
import { updateCharityPoint } from "./supabase";

// Tests that if the update to Supabase fails, the local donation is not added

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
});
