import { formatZodError, validationErrorResponse } from "@/lib/api-validation";
import { DatasetSynthesisSchema } from "@/schemas/dataset";
import { NextResponse } from "next/server";
import { API_GATEWAY_URL } from "../../env";
import { backendFetch } from "../../utils";

export async function POST(request: Request) {
	try {
		const formData = await request.formData();

		// Validate synthesis_config
		const configString = formData.get("synthesis_config");
		if (!configString || typeof configString !== "string") {
			return NextResponse.json(
				{ error: "synthesis_config is required" },
				{ status: 400 },
			);
		}

		let config: unknown;
		try {
			config = JSON.parse(configString);
		} catch (e) {
			return NextResponse.json(
				{ error: "Invalid JSON in synthesis_config" },
				{ status: 400 },
			);
		}

		// Runtime Validation using Zod
		const result = DatasetSynthesisSchema.safeParse(config);
		if (!result.success) {
			return validationErrorResponse(result.error);
		}

		// Also check if file is present
		const file = formData.get("file");
		if (!file) {
			return NextResponse.json(
				{ error: "File is required" },
				{ status: 400 },
			);
		}

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
