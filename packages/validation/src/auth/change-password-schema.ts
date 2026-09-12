import { z } from "zod";

export const changePasswordSchema = z
  .object({
    old_password: z.string().min(1, "Please enter the old password"),
    new_password1: z.string().min(1, "Please enter the new password"),
    new_password2: z.string().min(1, "Please enter the confirm new password"),
  })
  .refine((data) => data.new_password1 === data.new_password2, {
    message: "Passwords do not match",
    path: ["new_password2"],
  });

export type ChangePasswordSchemaType = z.infer<typeof changePasswordSchema>;
