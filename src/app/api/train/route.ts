import { NextResponse } from "next/server";
import { API_GATEWAY_URL } from "../env";
import { backendFetch } from "../utils";

export async function POST(request: Request) {
	try {
		const requestBody = await request.json();

		const hf_token = requestBody.hf_token;

		if (!hf_token) {
			return NextResponse.json(
				{ error: "HuggingFace API Key is required." },
				{ status: 400 },
			);
		}

		const backendPayload = {
			processed_dataset_id: requestBody.processed_dataset_id,
			job_name: requestBody.job_name,
			hf_token: hf_token,
			training_config: requestBody.training_config,
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
