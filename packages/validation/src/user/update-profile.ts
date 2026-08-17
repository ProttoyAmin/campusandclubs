import { z } from "zod";
import type { PatchedUserProfileRequest } from "@campus/api";

export const updateProfileSchema: z.ZodType<PatchedUserProfileRequest> =
  z.object({
    first_name: z.string().max(50).optional().nullable(),
    last_name: z.string().max(50).optional().nullable(),
    gender: z.enum(["male", "female", "other"]).optional().nullable(),
    bio: z.string().max(255).optional().nullable(),
    is_private: z.boolean().optional(),
  });
