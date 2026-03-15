import { describe, it, expect } from "vitest";
import { formatPrice, formatDate, slugify, truncateText } from "@/lib/utils";

describe("formatPrice", () => {
  it("should format cents to USD", () => {
    expect(formatPrice(50000)).toBe("$500.00");
    expect(formatPrice(1999)).toBe("$19.99");
    expect(formatPrice(0)).toBe("$0.00");
  });
});

describe("formatDate", () => {
  it("should format date string", () => {
    const result = formatDate("2026-03-15T12:00:00Z");
    expect(result).toContain("Mar");
    expect(result).toContain("2026");
  });

  it("should format Date object", () => {
    const result = formatDate(new Date("2026-06-15T12:00:00Z"));
    expect(result).toContain("2026");
    expect(result).toContain("Jun");
  });
});

describe("slugify", () => {
  it("should convert text to URL-safe slug", () => {
    expect(slugify("Vintage Guitar Pedals")).toBe("vintage-guitar-pedals");
    expect(slugify("Prince 1985 Tour")).toBe("prince-1985-tour");
  });

  it("should handle special characters", () => {
    expect(slugify("Rock & Roll")).toBe("rock-roll");
    expect(slugify("  extra  spaces  ")).toBe("extra-spaces");
  });

  it("should collapse multiple hyphens", () => {
    expect(slugify("a---b")).toBe("a-b");
  });
});

describe("truncateText", () => {
  it("should return text unchanged if under limit", () => {
    expect(truncateText("short", 100)).toBe("short");
  });

  it("should truncate and add ellipsis", () => {
    const result = truncateText("this is a longer piece of text", 10);
    expect(result.length).toBeLessThanOrEqual(13); // 10 + "..."
    expect(result).toContain("...");
  });

  it("should handle exact length", () => {
    expect(truncateText("exact", 5)).toBe("exact");
  });
});
