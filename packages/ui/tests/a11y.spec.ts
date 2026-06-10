import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Colour-contrast accessibility check.
 *
 * Runs axe-core's `color-contrast` rule against every connected route and
 * fails if any text fails the WCAG AA contrast ratio (4.5:1 for normal text,
 * 3:1 for large text). This catches regressions like dark surfaces rendered
 * with the browser-default black text.
 *
 * To broaden the audit to the full WCAG 2.1 AA ruleset, swap
 * `.withRules(["color-contrast"])` for `.withTags(["wcag2a", "wcag2aa"])`.
 */
const routes = [
	{ path: "/", name: "Cycle" },
	{ path: "/profiles", name: "Profils" },
	{ path: "/containers", name: "Conteneurs" },
	{ path: "/maintenances", name: "Maintenance" },
	{ path: "/help", name: "Aide" },
	{ path: "/io", name: "E/S" },
	{ path: "/settings", name: "Réglages" },
];

for (const route of routes) {
	test(`contrast: ${route.name} (${route.path})`, async ({ page }) => {
		await page.goto(route.path, { waitUntil: "networkidle" });
		// let any client-side data settle before auditing
		await page.waitForTimeout(500);

		const results = await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze();

		// Readable failure output: element + measured vs expected ratio
		const summary = results.violations.flatMap((v) =>
			v.nodes.map((n) => `  ${n.target.join(" ")}\n    ${n.failureSummary?.replace(/\n/g, "\n    ")}`),
		);

		expect(summary, `Contrast violations on ${route.path}:\n${summary.join("\n")}`).toEqual([]);
	});
}
