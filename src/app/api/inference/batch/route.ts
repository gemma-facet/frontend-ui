import type {
	BatchInferenceRequest,
	BatchInferenceResponse,
} from "@/types/inference";
import { NextResponse } from "next/server";
import { INFERENCE_SERVICE_URL } from "../../env";
import { backendFetch } from "../../utils";

export async function POST(request: Request) {
	try {
		const body = (await request.json()) as BatchInferenceRequest;

		if (
			!body.model_source ||
			!body.model_type ||
			!body.base_model_id ||
			!Array.isArray(body.messages) ||
			body.messages.length === 0
		) {
			return NextResponse.json(
				{
					error: "model_source, model_type, base_model_id, and a non-empty messages array are required",
				},
				{ status: 400 },
			);
		}

		const provider = body.base_model_id.split("/")[0];
		if (provider === "huggingface" && !body.hf_token) {
			return NextResponse.json(
				{ error: "hf_token is required for Hugging Face models" },
				{ status: 400 },
			);
		}

		const res = await backendFetch(
			request,
			`${INFERENCE_SERVICE_URL}/inference/batch`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			},
		);

		if (!res.ok) {
			const errorText = await res.text();
			return Response.json(
				{ error: `Batch inference service error: ${errorText}` },
				{ status: res.status },
			);
		}

		const data = (await res.json()) as BatchInferenceResponse;
		return NextResponse.json(data);
	} catch (err: unknown) {
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : String(err) },
			{ status: 500 },
		);
	}
}
