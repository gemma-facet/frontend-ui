import { NextResponse } from "next/server";
import { API_GATEWAY_URL } from "../../env";
import { backendFetch } from "../../utils";

export async function GET(
	request: Request,
	context: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await context.params;

		// MOCK MODE: Return fake dataset data for UI testing
		const MOCK_MODE = true;
		if (MOCK_MODE) {
			console.log(
				`Mock mode enabled - returning fake dataset data for ${id}`,
			);
			return NextResponse.json({
				dataset_name: id,
				dataset_subset: "default",
				processed_dataset_id: id,
				dataset_source: "huggingface",
				dataset_id: id,
				created_at: new Date().toISOString(),
				modality: "text",
				splits: [
					{
						split_name: "train",
						num_rows: 100,
						path: "train.jsonl",
						samples: [
							{
								messages: [
									{
										role: "user",
										content:
											"What is the capital of France?",
									},
									{
										role: "assistant",
										content:
											"The capital of France is Paris.",
									},
								],
							},
							{
								messages: [
									{
										role: "user",
										content: "Explain photosynthesis.",
									},
									{
										role: "assistant",
										content:
											"Photosynthesis is the process used by plants to convert light energy into chemical energy.",
									},
								],
							},
							{
								messages: [
									{
										role: "user",
										content:
											"What are the states of matter?",
									},
									{
										role: "assistant",
										content: "Solid, liquid, and gas.",
									},
								],
							},
							{
								messages: [
									{
										role: "user",
										content: "Who wrote Romeo and Juliet?",
									},
									{
										role: "assistant",
										content: "William Shakespeare.",
									},
								],
							},
							{
								messages: [
									{
										role: "user",
										content: "What is the largest planet?",
									},
									{
										role: "assistant",
										content: "Jupiter.",
									},
								],
							},
						],
					},
					{
						split_name: "test",
						num_rows: 20,
						path: "test.jsonl",
						samples: [
							{
								messages: [
									{
										role: "user",
										content: "Sample test question 1?",
									},
									{
										role: "assistant",
										content: "Sample test answer 1.",
									},
								],
							},
						],
					},
				],
			});
		}

		const response = await backendFetch(
			request,
			`${API_GATEWAY_URL}/datasets/${id}`,
		);

		if (!response.ok) {
			const errorData = await response.json();
			return NextResponse.json(
				{ error: errorData.error || "Failed to fetch dataset" },
				{ status: response.status },
			);
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("Failed to fetch dataset:", error);
		return NextResponse.json(
			{ error: "Could not fetch dataset." },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	request: Request,
	context: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await context.params;
		const url = `${API_GATEWAY_URL}/datasets/${id}`;

		const response = await backendFetch(request, url, {
			method: "DELETE",
		});

		if (!response.ok) {
			const errorData = await response.json();
			console.log("Error data:", errorData);
			return NextResponse.json(
				{ error: errorData.error || "Failed to delete dataset" },
				{ status: response.status },
			);
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("Failed to delete dataset:", error);
		return NextResponse.json(
			{ error: "Could not delete dataset." },
			{ status: 500 },
		);
	}
}
