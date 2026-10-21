import { z } from "zod";

export const resetPasswordSchema = z.object({
    password: z.string().min(1, "Please enter the new password"),
    re_password: z.string().min(1, "Please enter the confirm password"),
}).refine((data) => data.password === data.re_password, {
    message: "Passwords do not match",
    path: ["re_password"],
});

export type ResetPasswordSchemaType = z.infer<typeof resetPasswordSchema>;
