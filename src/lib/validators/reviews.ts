import { z } from "zod/v4";
import { MAX_COMMENT_LENGTH } from "@/lib/constants";

export const createReviewSchema = z.object({
  offerId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(MAX_COMMENT_LENGTH).optional().nullable(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
