import { z } from "zod";

export const userSchema = z.object({
    id: z.string(),
    username: z.string(),
    display_name: z.string().nullable(),
    email: z.string().nullable(),
    role: z.string(),
    is_active: z.boolean(),
    last_login_at: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
});

export const usersResponseSchema = z.object({
    users: z.array(userSchema),
});