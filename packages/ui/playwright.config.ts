import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for accessibility checks (axe-core).
 *
 * The dev (or preview) stack must already be running — start it with
 * `pnpm run dev` from the repo root, then run `pnpm --filter @nuster/ui test:a11y`.
 *
 * Override the target with A11Y_BASE_URL, e.g.
 *   A11Y_BASE_URL=https://ui.nuster.localhost pnpm --filter @nuster/ui test:a11y
 */
export default defineConfig({
	testDir: "./tests",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: 0,
	reporter: process.env.CI ? "github" : "list",
	use: {
		baseURL: process.env.A11Y_BASE_URL ?? "https://ui.nuster.localhost",
		// portless serves dev over HTTPS with a self-signed cert
		ignoreHTTPSErrors: true,
		trace: "on-first-retry",
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
});
