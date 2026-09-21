import { z } from "zod";

export const loginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
    keepSignedIn: z.boolean(),
});

export const authUserSchema = z.object({
    id: z.string(),
    username: z.string(),
    display_name: z.string().nullable(),
    email: z.string().nullable(),
    role: z.string(),
    last_login_at: z.string(),
});

export const loginResponseSchema = z.object({
    user: authUserSchema,
});