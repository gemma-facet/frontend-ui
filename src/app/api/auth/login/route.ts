import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const { token } = await request.json();
		if (!token) {
			return NextResponse.json(
				{ error: "Token is required" },
				{ status: 400 },
			);
		}

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
