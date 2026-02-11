import { validateRequest, validationErrorResponse } from "@/lib/api-validation";
import { EvaluationRequestSchema } from "@/schemas/inference";
import type { EvaluationResponse } from "@/types/inference";
import { INFERENCE_SERVICE_URL } from "../env";
import { backendFetch } from "../utils";

export async function POST(request: Request) {
	const validation = await validateRequest(request, EvaluationRequestSchema);

	if (!validation.success) {
		return validationErrorResponse(validation.error);
	}

	const body = validation.data;

	try {
		// Schema validation handles:
		// 1. Required fields
		// 2. hf_token conditional logic
		// 3. Mutual exclusivity of task_type and metrics

		// Additional custom check: Either task_type OR metrics must be present
		// The schema ensures they aren't BOTH present, but we also need to ensure ONE is present
		if (!body.task_type && (!body.metrics || body.metrics.length === 0)) {
			return Response.json(
				{
					error: "Either task_type or a non-empty list of metrics must be specified",
				},
				{ status: 400 },
			);
		}

		const response = await backendFetch(
			request,
			`${INFERENCE_SERVICE_URL}/evaluation`,
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
				{ error: `Evaluation service error: ${errorText}` },
				{ status: response.status },
			);
		}

		const result = (await response.json()) as EvaluationResponse;
		return Response.json(result);
	} catch (error) {
		console.error("Evaluation error:", error);
		return Response.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
