import { z } from "zod";
// import type { ClaimAffiliateRequestWritable, Role63cEnum } from "@campus/api";

export const roleEnum = ["student", "faculty", "staff", "alumni"] as const;

export const AffiliationClaimSchema = z.object({
  institute: z.string("Please select an institute"),
  email: z.email("Please enter a valid email address"),
  role: z.enum(roleEnum, "Please select a role"),
  password: z.string().min(1, "Password is required"),
});

export type AffiliationClaimInput = z.infer<typeof AffiliationClaimSchema>;
