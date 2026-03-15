import { describe, it, expect } from "vitest";
import { createMessageSchema } from "@/lib/validators/messages";

describe("createMessageSchema", () => {
  it("should accept valid message", () => {
    const result = createMessageSchema.safeParse({ body: "Hello there!" });
    expect(result.success).toBe(true);
  });

  it("should accept message with image", () => {
    const result = createMessageSchema.safeParse({
      body: "Check this out",
      imageUrl: "https://example.com/photo.jpg",
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty body", () => {
    const result = createMessageSchema.safeParse({ body: "" });
    expect(result.success).toBe(false);
  });

  it("should reject body over 2000 chars", () => {
    const result = createMessageSchema.safeParse({ body: "x".repeat(2001) });
    expect(result.success).toBe(false);
  });
});
