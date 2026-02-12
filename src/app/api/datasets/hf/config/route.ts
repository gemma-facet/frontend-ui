import { validateRequest, validationErrorResponse } from "@/lib/api-validation";
import { HFConfigSchema } from "@/schemas/dataset";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	const validation = await validateRequest(request, HFConfigSchema);

	if (!validation.success) {
		return validationErrorResponse(validation.error);
	}

	const { dataset_id, token } = validation.data;

	try {
		const response = await fetch(
			`https://datasets-server.huggingface.co/splits?dataset=${dataset_id}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
				method: "GET",
			},
		);

		const data = await response.json();

		if (data.error) {
			return NextResponse.json({ error: data.error }, { status: 400 });
		}

		const uniqueConfigs = [
			...new Set(
				data.splits.map((split: { config: string }) => split.config),
			),
		];

		return NextResponse.json({ configs: uniqueConfigs });
	} catch (error) {
		console.error("Error processing dataset:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
