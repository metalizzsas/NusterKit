/**
 * Validates required environment variables at startup.
 * Fails fast with a clear error listing all missing variables.
 */
export function validateEnv(): void {
	const isProduction = process.env.NODE_ENV === "production";

	// Required in production only (Balena environment provides these)
	const required: string[] = [];

	if (isProduction) {
		required.push(
			"DATABASE_URL",
			"BALENA_SUPERVISOR_ADDRESS",
			"BALENA_SUPERVISOR_API_KEY",
			"BALENA_APP_ID",
		);
	}

	const missing = required.filter(key => !process.env[key]);

	if (missing.length > 0) {
		const message = [
			"Missing required environment variables:",
			...missing.map(key => `  - ${key}`),
			"",
			"These must be set in the Balena device environment.",
		].join("\n");

		throw new Error(message);
	}
}
