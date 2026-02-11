import { validateRequest, validationErrorResponse } from "@/lib/api-validation";
import { HFPreviewSchema } from "@/schemas/dataset";
import { NextResponse } from "next/server";

async function fetchAsBase64(url: string) {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch image: ${response.statusText}`);
	}
	const buffer = await response.arrayBuffer();
	const contentType = response.headers.get("content-type") || "image/jpeg";
	return `data:${contentType};base64,${Buffer.from(buffer).toString("base64")}`;
}

interface HFFeature {
	name: string;
}

interface HFRowValue {
	src?: string;
}

interface HFRow {
	row: Record<string, HFRowValue | unknown>;
}

export async function POST(request: Request) {
	// 1. Runtime Validation
	const validation = await validateRequest(request, HFPreviewSchema);

	if (!validation.success) {
		return validationErrorResponse(validation.error);
	}

	const { dataset_id, config, split, token } = validation.data;

	try {
		const response = await fetch(
			`https://datasets-server.huggingface.co/first-rows?dataset=${dataset_id}&config=${config}&split=${split}`,
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

		// Get only the first 5 rows
		const top5Rows = data.rows.slice(0, 5) as HFRow[];

		// Process rows to fetch and convert images to base64
		for (const row of top5Rows) {
			for (const key in row.row) {
				const cellValue = row.row[key];
				// Check if it's an object with a 'src' property (likely an image)
				if (
					cellValue &&
					typeof cellValue === "object" &&
					(cellValue as HFRowValue).src
				) {
					try {
						// fetch the image here and return base64 to avoid link expiration
						const src = (cellValue as HFRowValue).src;
						if (typeof src === "string") {
							(row.row[key] as HFRowValue).src =
								await fetchAsBase64(src);
						}
					} catch (e) {
						console.error(`Failed to fetch image for ${key}:`, e);
						// Optionally, you can remove the image or set a placeholder
						row.row[key] = { error: "Failed to load image" };
					}
				}
			}
		}

		const columns = [];
		for (const feature of data.features as HFFeature[]) {
			columns.push(feature.name);
		}

		return NextResponse.json({
			dataset: data.dataset,
			config: data.config,
			split: data.split,
			rows: top5Rows,
			columns: columns,
		});
	} catch (error) {
		console.error("Error fetching dataset preview:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
