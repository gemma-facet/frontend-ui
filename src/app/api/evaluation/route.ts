import type { EvaluationRequest, EvaluationResponse } from "@/types/inference";
import { INFERENCE_SERVICE_URL } from "../env";
import { backendFetch } from "../utils";

// Set to true to enable mock mode for testing UI without backend
const MOCK_MODE =
	process.env.MOCK_BACKEND_MODE === "true" &&
	process.env.NODE_ENV === "development";

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

		// MOCK MODE: Return fake data for UI testing
		if (MOCK_MODE) {
			console.log("Mock mode enabled - returning fake evaluation data");

			// Simulate processing delay
			await new Promise(resolve => setTimeout(resolve, 1500));

			const mockResponse: EvaluationResponse = {
				metrics: {
					bleu: 0.6543,
					rouge: {
						rouge1: 0.7234,
						rouge2: 0.5123,
						rougeL: 0.6789,
						rougeLsum: 0.6712,
					},
					bertscore: {
						precision: 0.8421,
						recall: 0.8234,
						f1: 0.8326,
					},
					meteor: 0.7156,
				},
				num_samples: 3,
				dataset_id: body.dataset_id,
				samples: [
					{
						sample_index: 0,
						input: [
							{
								role: "user",
								content: "What is the capital of France?",
							},
						],
						prediction:
							"The capital of France is Paris. It is one of the most visited cities in the world and known for landmarks like the Eiffel Tower.",
						reference: "Paris is the capital of France.",
					},
					{
						sample_index: 1,
						input: [
							{
								role: "user",
								content:
									"Explain photosynthesis in simple terms.",
							},
						],
						prediction:
							"Photosynthesis is the process by which plants use sunlight to make food from carbon dioxide and water. The plant absorbs light through its leaves and converts it into energy.",
						reference:
							"Plants use sunlight to convert CO2 and water into glucose and oxygen through photosynthesis.",
					},
					{
						sample_index: 2,
						input: [
							{
								role: "user",
								content: "What are the three states of matter?",
							},
						],
						prediction:
							"The three states of matter are solid, liquid, and gas. Each state has different properties based on how tightly particles are packed together.",
						reference:
							"Matter exists in three main states: solid (fixed shape), liquid (takes container shape), and gas (fills available space).",
					},
				],
			};

			return Response.json(mockResponse);
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
