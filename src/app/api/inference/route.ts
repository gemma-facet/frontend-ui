import { validateRequest, validationErrorResponse } from "@/lib/api-validation";
import { InferenceRequestSchema } from "@/schemas/inference";
import type { InferenceResponse } from "@/types/inference";
import { INFERENCE_SERVICE_URL } from "../env";
import { backendFetch } from "../utils";

export async function POST(request: Request) {
	const validation = await validateRequest(request, InferenceRequestSchema);

	if (!validation.success) {
		return validationErrorResponse(validation.error);
	}

	const body = validation.data;

	try {
		// Schema validation already handles required fields and hf_token conditional logic

		const response = await backendFetch(
			request,
			`${INFERENCE_SERVICE_URL}/inference`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(body),
			},
		);

		if (!response.ok) {
			const errorText = await response.text();
			return Response.json(
				{ error: `Inference service error: ${errorText}` },
				{ status: response.status },
			);
		}

		const result = (await response.json()) as InferenceResponse;
		return Response.json(result);
	} catch (error) {
		console.error("Inference error:", error);
		return Response.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
