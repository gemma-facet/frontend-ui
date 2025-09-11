import type { GetExportResponse } from "@/types/export";
import { NextResponse } from "next/server";
import { EXPORT_SERVICE_URL } from "../../env";
import { backendFetch } from "../../utils";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ jobId: string }> },
) {
	try {
		const { jobId } = await params;

		const res = await backendFetch(
			request,
			`${EXPORT_SERVICE_URL}/exports/${jobId}`,
			{
				method: "GET",
				headers: { "Content-Type": "application/json" },
			},
		);

		const data = await res.json();
		if (!res.ok)
			throw new Error(data.error || "Failed to fetch export job");
		return NextResponse.json(data as GetExportResponse);
	} catch (err: unknown) {
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : String(err) },
			{ status: 500 },
		);
	}
}
