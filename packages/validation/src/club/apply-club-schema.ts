import {z} from "zod";

export const applyClubSchema = z.object({
    message: z.string(),
});
