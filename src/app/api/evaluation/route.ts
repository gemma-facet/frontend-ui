import type { EvaluationRequest, EvaluationResponse } from "@/types/inference";
import { INFERENCE_SERVICE_URL } from "../env";
import { backendFetch } from "../utils";

export async function POST(request: Request) {
	try {
		const body = (await request.json()) as EvaluationRequest;

		// Validate required fields
		if (
			!body.model_source ||
			!body.model_type ||
			!body.base_model_id ||
			!body.dataset_id
		) {
			return Response.json(
				{
					error: "model_source, model_type, base_model_id, and dataset_id are required",
				},
				{ status: 400 },
			);
		}

		const baseModelParts = body.base_model_id.split("/");
		const provider =
			baseModelParts[0] === "unsloth" ? "unsloth" : "huggingface";

		if (provider === "huggingface" && !body.hf_token) {
			return Response.json(
				{ error: "hf_token is required for Hugging Face models" },
				{ status: 400 },
			);
		}

		// Validate mutually exclusive options
		if (body.task_type && body.metrics) {
			return Response.json(
				{ error: "task_type and metrics are mutually exclusive" },
				{ status: 400 },
			);
		}

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
