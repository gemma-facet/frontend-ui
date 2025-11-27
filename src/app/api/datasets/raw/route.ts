import { NextResponse } from "next/server";
import { API_GATEWAY_URL } from "../../env";
import { backendFetch } from "../../utils";

// GET /api/datasets/raw - Get list of raw uploaded datasets
export async function GET(request: Request) {
	try {
		const res = await backendFetch(
			request,
			`${API_GATEWAY_URL}/datasets/raw`,
			{
				method: "GET",
			},
		);
		const data = await res.json();
		if (!res.ok)
			throw new Error(data.detail || "Failed to fetch raw datasets");
		return NextResponse.json(data);
	} catch (err: unknown) {
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : String(err) },
			{ status: 500 },
		);
	}
}
