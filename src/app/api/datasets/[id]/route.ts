import { NextResponse } from "next/server";
import { API_GATEWAY_URL } from "../../env";
import { backendFetch } from "../../utils";

export async function GET(
	request: Request,
	context: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await context.params;

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

		console.log("DELETE request to:", url);
		console.log("Dataset ID:", id);

		const response = await backendFetch(request, url, {
			method: "DELETE",
		});

		console.log("Response status:", response.status);
		console.log("Response ok:", response.ok);

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
