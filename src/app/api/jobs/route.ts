import type { TrainingJobResponse } from "@/schemas/training";
import { NextResponse } from "next/server";
import { API_GATEWAY_URL } from "../env";
import { backendFetch } from "../utils";

export async function GET(request: Request) {
	try {
		const res = await backendFetch(request, `${API_GATEWAY_URL}/jobs`);
		if (!res.ok) throw new Error("Failed to fetch jobs");
		const data = await res.json();
		const { jobs } = data as { jobs: TrainingJobResponse[] };
		return NextResponse.json({ jobs });
	} catch (err: unknown) {
		return NextResponse.json(
			{
				jobs: [],
				error: err instanceof Error ? err.message : String(err),
			},
			{ status: 500 },
		);
	}
}
