import { validateRequest, validationErrorResponse } from "@/lib/api-validation";
import { TrainRequestSchema } from "@/schemas/training";
import { NextResponse } from "next/server";
import { API_GATEWAY_URL } from "../env";
import { backendFetch } from "../utils";

export async function POST(request: Request) {
	// 1. Runtime Validation
	const validation = await validateRequest(request, TrainRequestSchema);

	if (!validation.success) {
		return validationErrorResponse(validation.error);
	}

	const body = validation.data;

	try {
		// Schema validation ensures hf_token and required fields are present

		const backendPayload = {
			processed_dataset_id: body.processed_dataset_id,
			job_name: body.job_name,
			hf_token: body.hf_token,
			training_config: body.training_config,
		};

		const response = await backendFetch(
			request,
			`${API_GATEWAY_URL}/train`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(backendPayload),
			},
		);

		const data = await response.json();

		if (!response.ok) {
			return NextResponse.json(
				{ error: data.error || "Failed to start training job" },
				{ status: response.status },
			);
		}

		return NextResponse.json(data);
	} catch (error) {
		console.error("Failed to start training job:", error);
		return NextResponse.json(
			{ error: "Could not start training job." },
			{ status: 500 },
		);
	}
}
