import { z } from "zod";


export const createRoleSchema = z
    .object({
        name: z.string().min(1, "Please enter role name"),
        color: z.string().min(1, "Please enter role color").max(9, "Please enter a valid color code"),
        permissions: z.number().array()
    })

export type ClubRoleCreateSchemaType = z.infer<typeof createRoleSchema>;
export type ClubRoleCreateOutputType = z.output<typeof createRoleSchema>;