import { z } from "zod";

export const DeleteResponseSchema = z
	.object({
		success: z.boolean().optional(),
		id: z.string().optional(),
		message: z.string().optional(),
	})
	.passthrough();

export type DeleteResponse = z.infer<typeof DeleteResponseSchema>;
