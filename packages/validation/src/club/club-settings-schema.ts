import { z } from "zod";
import type { ClubDetailRequest } from "@campus/api";
import { StatusOptions, PrivacyOptions, ScopeOptions, JoinModeOptions } from "./enums";


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
                code: z.ZodIssueCode.custom,
                message: "Secret clubs must be invite-only.",
                path: ["join_mode"], // This error will now correctly show up on the join_mode field
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

export type ClubSettingsRequestInput = z.input<typeof clubSettingsSchema>;
export type ClubSettingsRequestOutput = z.output<typeof clubSettingsSchema>;