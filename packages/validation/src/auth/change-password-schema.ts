import { z } from "zod";

export const changePasswordSchema = z
  .object({
    current_password: z.string().optional(),
    new_password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),
    repeat_password: z.string().min(1, "Please enter the confirm new password"),
  })
  .refine((data) => data.new_password === data.repeat_password, {
    message: "Passwords do not match",
    path: ["repeat_password"],
  });

export type ChangePasswordSchemaType = z.infer<typeof changePasswordSchema>;
