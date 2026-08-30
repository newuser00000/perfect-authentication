import { z } from "zod";

export const registerSchema = z.object({
    username: z
        .string("Username is required")
        .trim()
        .min(3, "Username must be at least 3 characters long")
        .max(100, "Username must be at most 100 characters long"),
    email: z.string("Email is required").trim().email("Invalid email format"),
    password: z
        .string("Password is required")
        .min(8, "Password must be at least 8 characters long")
        .max(100, "Password must be at most 100 characters long"),
});

export const loginSchema = z.object({
    email: z.string("Email is required").trim().email("Invalid email format"),
    password: z
        .string("Password is required")
        .min(8, "Password must be at least 8 characters long")
        .max(100, "Password must be at most 100 characters long"),
});
