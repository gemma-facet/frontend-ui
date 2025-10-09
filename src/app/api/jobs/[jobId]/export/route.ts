import type { ExportRequest, ExportResponse } from "@/types/export";
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
		const { export_type, destination, hf_token, hf_repo_id } =
			body as Partial<Omit<ExportRequest, "job_id">>;

		if (!export_type || !destination || destination.length === 0) {
			return NextResponse.json(
				{
					error: "export_type and destination are required",
				},
				{ status: 400 },
			);
		}

		// Validate destination
		const validdestination = ["gcs", "hf_hub"];
		const invaliddestination = destination.filter(
			(dest: string) => !validdestination.includes(dest),
		);
		if (invaliddestination.length > 0) {
			return NextResponse.json(
				{
					error: `Invalid destination: ${invaliddestination.join(
						", ",
					)}. Valid destination are: gcs, hf_hub`,
				},
				{ status: 400 },
			);
		}

		// If hf_hub is selected, require hf_token and hf_repo_id
		if (destination.includes("hf_hub")) {
			if (!hf_token) {
				return NextResponse.json(
					{
						error: "hf_token is required when hf_hub destination is selected",
					},
					{ status: 400 },
				);
			}
			if (!hf_repo_id) {
				return NextResponse.json(
					{
						error: "hf_repo_id is required when hf_hub destination is selected",
					},
					{ status: 400 },
				);
			}
		}

		const res = await backendFetch(
			request,
			`${API_GATEWAY_URL}/jobs/${jobId}/export`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					export_type,
					destination,
					hf_token,
					hf_repo_id,
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
