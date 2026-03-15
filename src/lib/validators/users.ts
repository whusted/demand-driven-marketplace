import { z } from "zod/v4";
import { MAX_BIO_LENGTH, MIN_USERNAME_LENGTH, MAX_USERNAME_LENGTH } from "@/lib/constants";

export const registerUserSchema = z.object({
  email: z.email(),
  username: z
    .string()
    .min(MIN_USERNAME_LENGTH)
    .max(MAX_USERNAME_LENGTH)
    .regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(8),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  bio: z.string().max(MAX_BIO_LENGTH).optional(),
  avatarUrl: z.string().url().optional(),
  location: z.string().max(200).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
