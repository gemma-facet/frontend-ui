import type { ExportJobsResponse } from "@/types/export";
import { NextResponse } from "next/server";
import { EXPORT_SERVICE_URL } from "../../env";
import { backendFetch } from "../../utils";

export async function GET(request: Request) {
	try {
		const res = await backendFetch(request, `${EXPORT_SERVICE_URL}/jobs`, {
			method: "GET",
			headers: { "Content-Type": "application/json" },
		});

		const data = await res.json();
		if (!res.ok)
			throw new Error(data.error || "Failed to fetch export jobs");
		return NextResponse.json(data as ExportJobsResponse);
	} catch (err: unknown) {
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : String(err) },
			{ status: 500 },
		);
	}
}
