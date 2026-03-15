import { z } from "zod/v4";
import {
  MIN_OFFER_DESCRIPTION_LENGTH,
  MAX_OFFER_DESCRIPTION_LENGTH,
  MAX_IMAGES_PER_OFFER,
} from "@/lib/constants";
import { OFFER_CONDITION } from "@/types";

export const createOfferSchema = z.object({
  price: z.number().int().min(1),
  condition: z.enum(OFFER_CONDITION),
  description: z.string().min(MIN_OFFER_DESCRIPTION_LENGTH).max(MAX_OFFER_DESCRIPTION_LENGTH),
  shippingMethod: z.string().optional().nullable(),
  imageIds: z.array(z.string()).min(1).max(MAX_IMAGES_PER_OFFER),
});

export type CreateOfferInput = z.infer<typeof createOfferSchema>;

export const updateOfferSchema = createOfferSchema.partial();

export type UpdateOfferInput = z.infer<typeof updateOfferSchema>;
