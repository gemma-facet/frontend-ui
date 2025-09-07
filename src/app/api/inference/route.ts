import type { InferenceRequest, InferenceResponse } from "@/types/inference";
import { NextResponse } from "next/server";
import { INFERENCE_SERVICE_URL } from "../env";
import { backendFetch } from "../utils";

export async function POST(request: Request) {
	try {
		const body = (await request.json()) as InferenceRequest;

		// Validate required fields
		if (
			!body.model_source ||
			!body.model_type ||
			!body.base_model_id ||
			!body.prompt
		) {
			return Response.json(
				{
					error: "model_source, model_type, base_model_id, and prompt are required",
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
