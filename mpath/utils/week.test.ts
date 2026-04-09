import { addWeeks, formatWeekRange, startOfWeekMonday } from "./week";

// Tests that week/date helper functions return the correct values

describe("utils/week", () => {
  describe("startOfWeekMonday", () => {
    it("returns the Monday of the same week and resets the time to midnight", () => {
      const input = new Date(2024, 2, 6, 15, 30, 45); 

      const result = startOfWeekMonday(input);

      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(2);
      expect(result.getDate()).toBe(4);
      expect(result.getDay()).toBe(1);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });

    it("treats Sunday as part of the week that started on the previous Monday", () => {
      const input = new Date(2024, 2, 10, 9, 0, 0);

      const result = startOfWeekMonday(input);

      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(2);
      expect(result.getDate()).toBe(4);
      expect(result.getDay()).toBe(1);
    });
  });

  describe("addWeeks", () => {
    it("adds whole weeks without mutating the original date", () => {
      const input = new Date(2024, 2, 6, 12, 0, 0);

      const result = addWeeks(input, 2);

      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(2);
      expect(result.getDate()).toBe(20);
      expect(input.getDate()).toBe(6);
    });
  });

  describe("formatWeekRange", () => {
    it("formats week range within same month", () => {
      const start = new Date(2024, 2, 4, 12, 0, 0);

      const result = formatWeekRange(start);

      expect(result).toContain("4");
      expect(result).toContain("10");
      expect(result).toContain("–");
    });

    it("formats week range crossing into new month", () => {
      const start = new Date(2024, 2, 30, 12, 0, 0);

      const result = formatWeekRange(start);

      expect(result).toContain("30");
      expect(result).toContain("5");
      expect(result).toContain("–");
    });
  });
});
