import { NextResponse } from "next/server";
import { API_GATEWAY_URL } from "../../env";
import { backendFetch } from "../../utils";

export async function POST(request: Request) {
	try {
		const formData = await request.formData();
		const file = formData.get("file");

		if (!file) {
			return NextResponse.json(
				{ error: "File is required" },
				{ status: 400 },
			);
		}

		const res = await backendFetch(
			request,
			`${API_GATEWAY_URL}/datasets/upload`,
			{
				method: "POST",
				body: formData,
			},
		);
		const data = await res.json();
		if (!res.ok) throw new Error(data.detail || "Failed to upload dataset");
		return NextResponse.json(data);
	} catch (err: unknown) {
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : String(err) },
			{ status: 500 },
		);
	}
}
