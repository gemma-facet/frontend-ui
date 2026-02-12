import { NextResponse } from "next/server";
import { z } from "zod";

export type ValidationResult<T> =
	| { success: true; data: T }
	| { success: false; error: z.ZodError };

export async function validateRequest<T>(
	request: Request,
	schema: z.Schema<T>,
): Promise<ValidationResult<T>> {
	try {
		const body = await request.json();
		const result = schema.safeParse(body);

		if (result.success) {
			return { success: true, data: result.data };
		}

		return { success: false, error: result.error };
	} catch (error) {
		// Handle JSON parsing errors
		return {
			success: false,
			error: new z.ZodError([
				{
					code: z.ZodIssueCode.custom,
					path: [],
					message: "Invalid JSON body",
				},
			]),
		};
	}
}

export function formatZodError(error: z.ZodError): string {
	// ZodError has an 'issues' property containing the ZodIssue array
	return error.issues
		.map(err => `${err.path.join(".")}: ${err.message}`)
		.join(", ");
}

export function validationErrorResponse(error: z.ZodError) {
	return NextResponse.json({ error: formatZodError(error) }, { status: 400 });
}

// Helper to validate API response data (safe parsing)
export function validateData<T>(data: unknown, schema: z.Schema<T>): T {
	const result = schema.safeParse(data);

	if (!result.success) {
		const errorMessage = formatZodError(result.error);
		console.error(`[API Response Validation Error]: ${errorMessage}`);
		throw new Error(`Response validation failed: ${errorMessage}`);
	}

	return result.data;
}
