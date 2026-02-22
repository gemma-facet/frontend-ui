// Helper to extract Firebase token from request and create headers for backend calls
export function createBackendHeaders(request: Request): Record<string, string> {
	const token = request.headers
		.get("cookie")
		?.match(/firebaseIdToken=([^;]+)/)?.[1];

	const headers: Record<string, string> = {};
	if (token) {
		headers.Authorization = `Bearer ${token}`;
	} else {
		console.warn(
			"[createBackendHeaders] No Firebase token found in cookies",
		);
	}

	return headers;
}

// Helper for backend API calls with auth
export async function backendFetch(
	request: Request,
	url: string,
	options: RequestInit = {},
): Promise<Response> {
	const authHeaders = createBackendHeaders(request);

	return fetch(url, {
		...options,
		headers: {
			...authHeaders,
			...options.headers,
		},
	});
}
