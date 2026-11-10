import { z } from "zod";

export const signInSchema = z.object({
  login: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
});

export type SignInSchemaType = z.infer<typeof signInSchema>;
