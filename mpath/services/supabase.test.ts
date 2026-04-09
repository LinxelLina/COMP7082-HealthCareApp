import { addDonation } from "./profile";
import { addNewCharity, fetchCharities, updateCharityPoint } from "./supabase";

// Tests coordinating local db if SUpabase fails

const mockRpc = jest.fn();
const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockFrom = jest.fn(() => ({
  select: (...args: any[]) => mockSelect(...args),
  insert: (...args: any[]) => mockInsert(...args),
}));

jest.mock("@/utils/supabase", () => ({
  supabase: {
    rpc: (...args: any[]) => mockRpc(...args),
    from: (...args: any[]) => mockFrom(...args),
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

describe("fetchCharities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("maps Supabase charity rows into the app charity format", async () => {
    mockSelect.mockResolvedValue({
      data: [
        {
          id: 7,
          charity_name: "Test Charity",
          charity_type: null,
          description: "Helping people",
          website: "https://example.org",
          contact_email: "hello@example.org",
          contribution_total: 42,
        },
      ],
      error: null,
    });

    const result = await fetchCharities();

    expect(mockFrom).toHaveBeenCalledWith("charity");
    expect(result).toEqual([
      {
        id: "7",
        name: "Test Charity",
        category: "Other",
        description: "Helping people",
        website: "https://example.org",
        contactEmail: "hello@example.org",
        funds: 42,
      },
    ]);
  });
});

describe("addNewCharity", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns false when the Supabase insert fails", async () => {
    mockInsert.mockResolvedValue({
      error: { message: "Insert failed" },
    });

    const result = await addNewCharity({
      name: "Test Charity",
      type: "Medical",
      description: "Helping people",
      website: "https://example.org",
      contactEmail: "hello@example.org",
    });

    expect(mockFrom).toHaveBeenCalledWith("charity");
    expect(result).toBe(false);
  });
});
