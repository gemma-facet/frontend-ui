function requireEnv(name: string): string {
	const value = process.env[name];
	if (!value) throw new Error(`${name} is not set`);
	return value;
}

export const API_GATEWAY_URL =
	process.env.NODE_ENV === "production"
		? requireEnv("API_GATEWAY_URL")
		: requireEnv("API_GATEWAY_URL_STAGING");
export const INFERENCE_SERVICE_URL =
	process.env.NODE_ENV === "production"
		? requireEnv("INFERENCE_SERVICE_URL")
		: requireEnv("INFERENCE_SERVICE_URL_STAGING");
