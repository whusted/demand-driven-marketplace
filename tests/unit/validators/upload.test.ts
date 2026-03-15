import { describe, it, expect } from "vitest";
import { uploadRequestSchema } from "@/lib/validators/upload";

describe("uploadRequestSchema", () => {
  const valid = {
    filename: "photo.jpg",
    contentType: "image/jpeg" as const,
    size: 2 * 1024 * 1024,
  };

  it("should accept valid upload request", () => {
    expect(uploadRequestSchema.safeParse(valid).success).toBe(true);
  });

  it("should accept webp", () => {
    expect(
      uploadRequestSchema.safeParse({ ...valid, contentType: "image/webp" }).success,
    ).toBe(true);
  });

  it("should reject invalid content type", () => {
    expect(
      uploadRequestSchema.safeParse({ ...valid, contentType: "image/gif" }).success,
    ).toBe(false);
  });

  it("should reject files over 10MB", () => {
    expect(
      uploadRequestSchema.safeParse({ ...valid, size: 11 * 1024 * 1024 }).success,
    ).toBe(false);
  });

  it("should reject zero-size files", () => {
    expect(uploadRequestSchema.safeParse({ ...valid, size: 0 }).success).toBe(false);
  });
});
