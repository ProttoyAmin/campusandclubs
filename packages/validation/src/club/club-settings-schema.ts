import { z } from "zod";
import type { ClubDetailRequest } from "@campus/api";
import {
  StatusOptions,
  PrivacyOptions,
  ScopeOptions,
  JoinModeOptions,
} from "./enums";

export type ClubSettingsRequest = Pick<
  ClubDetailRequest,
  "status" | "join_mode" | "privacy" | "scope"
>;

export const clubSettingsSchema: z.ZodType<ClubSettingsRequest> = z
  .object({
    status: z.enum(StatusOptions).optional(),
    join_mode: z.enum(JoinModeOptions).optional(),
    privacy: z.enum(PrivacyOptions).optional(),
    scope: z.enum(ScopeOptions).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.privacy === "secret" && data.join_mode !== "invite_only") {
      ctx.addIssue({
        code: "custom",
        message: "Secret clubs must be invite-only.",
        path: ["join_mode"],
      });
    }
    if (
      data.privacy === "private" &&
      !["application", "invite_only"].includes(data.join_mode ?? "")
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Private clubs must use application or invite-only join mode.",
        path: ["join_mode"],
      });
    }

    if (data.privacy === "public" && data.join_mode === "invite_only") {
      ctx.addIssue({
        code: "custom",
        message: "Public clubs cannot use invite only join mode.",
        path: ["join_mode"],
      });
    }

    if (data.scope !== "global") {
      ctx.addIssue({
        code: "custom",
        message: "Scope must be global",
        path: ["scope"],
      });
    }
  });

export type ClubSettingsRequestInput = z.input<typeof clubSettingsSchema>;
export type ClubSettingsRequestOutput = z.output<typeof clubSettingsSchema>;
