import { z } from "zod";
import { PrivacyOptions, ScopeOptions, JoinModeOptions } from "./enums";
import { Privacy, JoinMode, Scope } from "./enums";

export const privacyEnumType = z.enum(PrivacyOptions);
export const joinEnumType = z.enum(JoinModeOptions);
export const scopeEnumType = z.enum(ScopeOptions);

const imageFile = z
  .instanceof(File)
  .refine(
    (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
    "Only JPEG, PNG, and WebP images are allowed.",
  )
  .refine(
    (file) => file.size <= 5 * 1024 * 1024,
    "Image must be smaller than 5 MB.",
  );

export const clubCreateSchema = z
  .object({
    name: z.string().min(1, "Please enter the club name"),
    about: z.string().optional(),
    privacy: privacyEnumType,
    scope: scopeEnumType,
    join_mode: joinEnumType,
    origin: z.string().nullable().optional(),
    department_templates: z.array(z.string()).optional(),
    avatar: imageFile.optional().nullable(),
    banner: imageFile.optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.privacy === "secret" && data.join_mode !== "invite_only") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Secret clubs must be invite-only.",
        path: ["join_mode"],
      });
    }
    if (
      data.privacy === "private" &&
      !["application", "invite_only"].includes(data.join_mode ?? "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Private clubs must use application or invite-only join mode.",
        path: ["join_mode"],
      });
    }
  });

export type ClubCreateSchemaType = z.infer<typeof clubCreateSchema>;
export type ClubCreateOutputType = z.output<typeof clubCreateSchema>;
