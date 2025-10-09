import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	const path = request.nextUrl.pathname;
	const isProtected =
		path.startsWith("/dashboard") ||
		(path.startsWith("/api") && !path.startsWith("/api/auth"));

	const token = request.cookies.get("firebaseIdToken")?.value;

	if (isProtected && !token) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	if (path === "/login" && token) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/dashboard/:path*", "/api/:path*", "/login"],
};
