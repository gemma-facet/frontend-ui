import { z } from "zod";

// This Base Type for the all the delete API Response
export const DeleteResponseSchema = z
	.object({
		success: z.boolean().optional(),
		id: z.string().optional(),
		message: z.string().optional(),
	})
	.passthrough();

export type DeleteResponse = z.infer<typeof DeleteResponseSchema>;
