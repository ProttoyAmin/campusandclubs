import { z } from "zod";
import type { ClubCreateRequest } from '@campus/api';

export const clubCreateSchema = z.object({
    name: z.string().min(1, "Please enter the club name"),
    about: z.string().min(1, "Please enter the club description"),
    privacy: z.string().min(1, "Please select the club privacy"),
    scope: z.string().min(1, "Please select the club scope"),
    origin: z.string().nullable().optional()
})

export type ClubCreateSchemaType = z.infer<typeof clubCreateSchema>;
export type ClubCreateOutputType = z.output<typeof clubCreateSchema>;
