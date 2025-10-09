import { NextResponse } from "next/server";

export async function POST() {
	try {
		const response = NextResponse.json({ success: true });
		response.cookies.set("firebaseIdToken", "", {
			httpOnly: true,
			secure: process.env.NODE_ENV !== "development",
			maxAge: 0,
			sameSite: "lax",
			path: "/",
		});

		return response;
	} catch (error) {
		console.error("Logout API error:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
