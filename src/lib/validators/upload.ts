import { z } from "zod/v4";
import { MAX_IMAGE_SIZE, ALLOWED_IMAGE_TYPES } from "@/lib/constants";

export const uploadRequestSchema = z.object({
  filename: z.string().min(1),
  contentType: z.enum(ALLOWED_IMAGE_TYPES),
  size: z.number().int().min(1).max(MAX_IMAGE_SIZE),
});

export type UploadRequestInput = z.infer<typeof uploadRequestSchema>;
