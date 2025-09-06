import type { ExportRequest, ExportResponse } from "@/types/export";
import { NextResponse } from "next/server";
import { EXPORT_SERVICE_URL } from "../env";
import { backendFetch } from "../utils";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { job_id, export_type, hf_token } =
			body as Partial<ExportRequest>;

		if (!job_id || !export_type) {
			return NextResponse.json(
				{
					error: "job_id and export_type are required",
				},
				{ status: 400 },
			);
		}

		const res = await backendFetch(
			request,
			`${EXPORT_SERVICE_URL}/export`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					job_id,
					export_type,
					hf_token,
				}),
			},
		);

		const data = await res.json();
		if (!res.ok) throw new Error(data.error || "Export request failed");
		return NextResponse.json(data as ExportResponse);
	} catch (err: unknown) {
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : String(err) },
			{ status: 500 },
		);
	}
}
