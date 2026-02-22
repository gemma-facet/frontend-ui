import { validateRequest, validationErrorResponse } from "@/lib/api-validation";
import { BatchInferenceRequestSchema } from "@/schemas/inference";
import type { BatchInferenceResponse } from "@/types/inference";
import { NextResponse } from "next/server";
import { INFERENCE_SERVICE_URL } from "../../env";
import { backendFetch } from "../../utils";

export async function POST(request: Request) {
	// 1. Runtime Validation with Zod
	const validation = await validateRequest(
		request,
		BatchInferenceRequestSchema,
	);

	if (!validation.success) {
		return validationErrorResponse(validation.error);
	}

	const body = validation.data;

	try {
		// 2. Backend Forwarding
		// Schema validation already guaranteed hf_token presence if needed

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
