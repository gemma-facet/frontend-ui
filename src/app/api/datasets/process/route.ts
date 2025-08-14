import { NextResponse } from "next/server";
import { API_GATEWAY_URL } from "../../env";
import { backendFetch } from "../../utils";

// POST /api/datasets/process - Process uploaded dataset
export async function POST(request: Request) {
	try {
		const body = await request.json();
		const res = await backendFetch(
			request,
			`${API_GATEWAY_URL}/datasets/process`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			},
		);
		const data = await res.json();
		if (!res.ok)
			throw new Error(data.detail || "Failed to process dataset");
		return NextResponse.json(data);
	} catch (err: unknown) {
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : String(err) },
			{ status: 500 },
		);
	}
}
