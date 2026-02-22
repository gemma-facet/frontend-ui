import { formatZodError, validationErrorResponse } from "@/lib/api-validation";
import { ExportRequestSchema } from "@/schemas/export";
import { NextResponse } from "next/server";
import { API_GATEWAY_URL } from "../../../env";
import { backendFetch } from "../../../utils";

export async function POST(
	request: Request,
	context: { params: Promise<{ jobId: string }> },
) {
	try {
		const { jobId } = await context.params;
		const body = await request.json();

		// Combine route param with body for full schema validation
		const payload = {
			...body,
			job_id: jobId,
		};

		// Validate using the schema
		const result = ExportRequestSchema.safeParse(payload);

		if (!result.success) {
			return validationErrorResponse(result.error);
		}

		const validatedData = result.data;

		const res = await backendFetch(
			request,
			`${API_GATEWAY_URL}/jobs/${jobId}/export`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					export_type: validatedData.export_type,
					destination: validatedData.destination,
					hf_token: validatedData.hf_token,
					hf_repo_id: validatedData.hf_repo_id,
				}),
			},
		);

		const data = await res.json();
		if (!res.ok) throw new Error(data.error || "Export request failed");
		return NextResponse.json(data);
	} catch (err: unknown) {
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : String(err) },
			{ status: 500 },
		);
	}
}
