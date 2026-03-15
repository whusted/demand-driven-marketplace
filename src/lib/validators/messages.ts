import { z } from "zod/v4";
import { MAX_MESSAGE_LENGTH } from "@/lib/constants";

export const createMessageSchema = z.object({
  body: z.string().min(1).max(MAX_MESSAGE_LENGTH),
  imageUrl: z.string().url().optional().nullable(),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
