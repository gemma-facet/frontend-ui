import { validateRequest, validationErrorResponse } from "@/lib/api-validation";
import { ExportRequestSchema } from "@/schemas/export";
import type { ListExportsResponse } from "@/types/export";
import { NextResponse } from "next/server";
import { API_GATEWAY_URL } from "../env";
import { backendFetch } from "../utils";

export async function GET(request: Request) {
	try {
		const res = await backendFetch(request, `${API_GATEWAY_URL}/exports`, {
			method: "GET",
			headers: { "Content-Type": "application/json" },
		});

		const data = await res.json();
		if (!res.ok)
			throw new Error(data.error || "Failed to fetch export jobs");
		const { jobs } = data as ListExportsResponse;
		return NextResponse.json({ jobs });
	} catch (err: unknown) {
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : String(err) },
			{ status: 500 },
		);
	}
}

export async function POST(request: Request) {
	const validation = await validateRequest(request, ExportRequestSchema);

	if (!validation.success) {
		return validationErrorResponse(validation.error);
	}

	const body = validation.data;

	try {
		const res = await backendFetch(
			request,
			`${API_GATEWAY_URL}/jobs/${body.job_id}/export`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					export_type: body.export_type,
					destination: body.destination,
					hf_token: body.hf_token,
					hf_repo_id: body.hf_repo_id,
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
