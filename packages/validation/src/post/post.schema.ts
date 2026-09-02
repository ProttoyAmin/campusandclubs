import { z } from "zod";

export const PostCreateSchema = z
  .object({
    content: z
      .string()
      .max(200, "Post content cannot exceed 200 characters")
      .optional(),
    media: z
      .custom<File | undefined>((file) => {
        if (!file) return true;
        return file instanceof File;
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.content && !data.media) {
      ctx.addIssue({
        code: "custom",
        message: "Please provide content or media",
      });
    }
  });

export type PostCreateInput = z.infer<typeof PostCreateSchema>;
