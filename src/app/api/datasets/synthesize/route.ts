import { NextResponse } from "next/server";
import { API_GATEWAY_URL } from "../../env";
import { backendFetch } from "../../utils";

export async function POST(request: Request) {
	try {
		const formData = await request.formData();
		const res = await backendFetch(
			request,
			`${API_GATEWAY_URL}/datasets/synthesize`,
			{
				method: "POST",
				body: formData,
			},
		);
		const data = await res.json();
		if (!res.ok)
			throw new Error(data.detail || "Failed to synthesize dataset");
		return NextResponse.json(data);
	} catch (err: unknown) {
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : String(err) },
			{ status: 500 },
		);
	}
}
