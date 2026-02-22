import { z } from "zod";

export const LoginSchema = z.object({
	token: z.string().min(1, "Firebase token is required"),
});

export type LoginRequest = z.infer<typeof LoginSchema>;
