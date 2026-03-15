import { describe, it, expect } from "vitest";
import { createAlertSchema } from "@/lib/validators/alerts";

describe("createAlertSchema", () => {
  it("should accept alert with keywords", () => {
    const result = createAlertSchema.safeParse({ keywords: ["vintage", "synth"] });
    expect(result.success).toBe(true);
  });

  it("should accept alert with categoryId", () => {
    const result = createAlertSchema.safeParse({
      categoryId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("should accept alert with tags", () => {
    const result = createAlertSchema.safeParse({ tags: ["analog", "1980s"] });
    expect(result.success).toBe(true);
  });

  it("should reject alert with no criteria", () => {
    const result = createAlertSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("should reject more than 10 keywords", () => {
    const keywords = Array.from({ length: 11 }, (_, i) => `kw${i}`);
    const result = createAlertSchema.safeParse({ keywords });
    expect(result.success).toBe(false);
  });
});
