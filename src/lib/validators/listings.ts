import { z } from "zod/v4";
import {
  MIN_TITLE_LENGTH,
  MAX_TITLE_LENGTH,
  MIN_DESCRIPTION_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_IMAGES_PER_LISTING,
} from "@/lib/constants";
import { CONDITION } from "@/types";

export const createListingSchema = z.object({
  title: z.string().min(MIN_TITLE_LENGTH).max(MAX_TITLE_LENGTH),
  description: z.string().min(MIN_DESCRIPTION_LENGTH).max(MAX_DESCRIPTION_LENGTH),
  categoryId: z.string().uuid().optional().nullable(),
  condition: z.enum(CONDITION).default("any"),
  maxPrice: z.number().int().min(0).optional().nullable(),
  currency: z.string().default("USD"),
  location: z.string().optional().nullable(),
  shippingOk: z.boolean().default(true),
  localOnly: z.boolean().default(false),
  expiresAt: z.string().datetime().optional().nullable(),
  imageIds: z.array(z.string()).max(MAX_IMAGES_PER_LISTING).default([]),
  tags: z.array(z.string()).default([]),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;

export const updateListingSchema = createListingSchema.partial();

export type UpdateListingInput = z.infer<typeof updateListingSchema>;
