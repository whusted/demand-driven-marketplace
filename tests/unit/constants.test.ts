import { describe, it, expect } from "vitest";
import {
  MAX_IMAGE_SIZE,
  MAX_IMAGES_PER_LISTING,
  MAX_IMAGES_PER_OFFER,
  ALLOWED_IMAGE_TYPES,
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_MAX_LIMIT,
} from "@/lib/constants";

describe("constants", () => {
  it("should set max image size to 10MB", () => {
    expect(MAX_IMAGE_SIZE).toBe(10 * 1024 * 1024);
  });

  it("should limit listing images to 5", () => {
    expect(MAX_IMAGES_PER_LISTING).toBe(5);
  });

  it("should limit offer images to 10", () => {
    expect(MAX_IMAGES_PER_OFFER).toBe(10);
  });

  it("should allow jpeg, png, and webp", () => {
    expect(ALLOWED_IMAGE_TYPES).toContain("image/jpeg");
    expect(ALLOWED_IMAGE_TYPES).toContain("image/png");
    expect(ALLOWED_IMAGE_TYPES).toContain("image/webp");
    expect(ALLOWED_IMAGE_TYPES.length).toBe(3);
  });

  it("should have sensible pagination defaults", () => {
    expect(PAGINATION_DEFAULT_LIMIT).toBe(20);
    expect(PAGINATION_MAX_LIMIT).toBe(100);
  });
});
