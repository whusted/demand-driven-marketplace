import { describe, it, expect } from "vitest";
import { updateProfileSchema, registerUserSchema } from "@/lib/validators/users";

describe("registerUserSchema", () => {
  it("should accept valid registration", () => {
    const result = registerUserSchema.safeParse({
      email: "test@example.com",
      username: "collector42",
      password: "securepass123",
    });
    expect(result.success).toBe(true);
  });

  it("should reject username under 3 chars", () => {
    const result = registerUserSchema.safeParse({
      email: "t@e.com",
      username: "ab",
      password: "securepass123",
    });
    expect(result.success).toBe(false);
  });

  it("should reject username with special chars", () => {
    const result = registerUserSchema.safeParse({
      email: "t@e.com",
      username: "bad user!",
      password: "securepass123",
    });
    expect(result.success).toBe(false);
  });

  it("should accept underscores in username", () => {
    const result = registerUserSchema.safeParse({
      email: "t@e.com",
      username: "good_user_1",
      password: "securepass123",
    });
    expect(result.success).toBe(true);
  });
});

describe("updateProfileSchema", () => {
  it("should accept partial profile update", () => {
    const result = updateProfileSchema.safeParse({ displayName: "Jane" });
    expect(result.success).toBe(true);
  });

  it("should reject bio over 500 chars", () => {
    const result = updateProfileSchema.safeParse({ bio: "x".repeat(501) });
    expect(result.success).toBe(false);
  });
});
