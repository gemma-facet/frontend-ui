import { validateRequest, validationErrorResponse } from "@/lib/api-validation";
import { LoginSchema } from "@/schemas/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	// 1. Runtime Validation
	const validation = await validateRequest(request, LoginSchema);

	if (!validation.success) {
		return validationErrorResponse(validation.error);
	}

	const { token } = validation.data;

	try {
		const response = NextResponse.json({ success: true });
		response.cookies.set("firebaseIdToken", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV !== "development",
			maxAge: 60 * 60, // 1 hour to match Firebase token expiration
			sameSite: "lax",
			path: "/",
		});

		return response;
	} catch (error) {
		console.error("Login API error:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
