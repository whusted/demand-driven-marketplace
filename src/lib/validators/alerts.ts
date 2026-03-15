import { z } from "zod/v4";
import { MAX_KEYWORDS_PER_ALERT } from "@/lib/constants";

export const createAlertSchema = z
  .object({
    categoryId: z.string().uuid().optional().nullable(),
    keywords: z.array(z.string()).max(MAX_KEYWORDS_PER_ALERT).optional().default([]),
    tags: z.array(z.string()).optional().default([]),
  })
  .refine(
    (data) =>
      data.categoryId != null ||
      (data.keywords && data.keywords.length > 0) ||
      (data.tags && data.tags.length > 0),
    { message: "At least one of categoryId, keywords, or tags must be provided" },
  );

export type CreateAlertInput = z.infer<typeof createAlertSchema>;

export const updateAlertSchema = z.object({
  categoryId: z.string().uuid().optional().nullable(),
  keywords: z.array(z.string()).max(MAX_KEYWORDS_PER_ALERT).optional(),
  tags: z.array(z.string()).optional(),
});

export type UpdateAlertInput = z.infer<typeof updateAlertSchema>;
