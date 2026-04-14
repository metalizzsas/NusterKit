/**
 * Validates required environment variables at startup.
 * Fails fast with a clear error listing all missing variables.
 */
export function validateEnv(): void {
	const isProduction = process.env.NODE_ENV === "production";

	// Always required
	const required: string[] = [
		"PORT",
	];

	// Required in production only (Balena environment provides these)
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
			isProduction
				? "These must be set in the Balena device environment."
				: "Set them in a .env file or export them before starting.",
		].join("\n");

		throw new Error(message);
	}

	// Warn for optional but recommended variables
	const optional = isProduction ? [] : ["SIMULATION_ADDRESS", "SIMULATION_PORT"];
	const missingOptional = optional.filter(key => !process.env[key]);
	if (missingOptional.length > 0) {
		console.warn(`[env] Optional variables not set: ${missingOptional.join(", ")}`);
	}
}
