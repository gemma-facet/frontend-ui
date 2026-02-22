import type { DatasetResponse } from "@/schemas/dataset";
import { NextResponse } from "next/server";
import { API_GATEWAY_URL } from "../env";
import { backendFetch } from "../utils";

export async function GET(request: Request) {
	try {
		const res = await backendFetch(request, `${API_GATEWAY_URL}/datasets`);
		if (!res.ok) throw new Error("Failed to fetch datasets");
		const data = await res.json();
		const { datasets } = data as { datasets: DatasetResponse[] };

		return NextResponse.json({ datasets });
	} catch (err: unknown) {
		return NextResponse.json(
			{
				datasets: [],
				error: err instanceof Error ? err.message : String(err),
			},
			{ status: 500 },
		);
	}
}
