import { DatasetSchema } from "@/schemas/dataset";
import { NextResponse } from "next/server";
import { z } from "zod";
import { API_GATEWAY_URL } from "../env";
import { backendFetch } from "../utils";

export async function GET(request: Request) {
	try {
		const res = await backendFetch(request, `${API_GATEWAY_URL}/datasets`);
		if (!res.ok) throw new Error("Failed to fetch datasets");
		const data = await res.json();
		const validated = z
			.object({ datasets: z.array(DatasetSchema) })
			.parse(data);
		return NextResponse.json(validated);
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
