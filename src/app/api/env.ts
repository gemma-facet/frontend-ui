function requireEnv(name: string): string {
	const value = process.env[name];
	if (!value) throw new Error(`${name} is not set`);
	return value;
}

export const API_GATEWAY_URL = requireEnv("API_GATEWAY_URL");
export const INFERENCE_SERVICE_URL = requireEnv("INFERENCE_SERVICE_URL");
export const EXPORT_SERVICE_URL = requireEnv("EXPORT_SERVICE_URL");
