import { z } from "zod";

export const signUpSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters long")
      .max(150, "Username must be at most 150 characters long")
      .regex(
        /^[a-zA-Z0-9_.]*$/,
        "Username can only contain letters, numbers, underscores, and periods",
      ),
    email: z.email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),
    re_password: z.string(),
  })
  .superRefine(({ password, re_password }, ctx) => {
    if (password !== re_password) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["re_password"],
      });
    }
  });

export type SignUpSchemaType = z.infer<typeof signUpSchema>;
