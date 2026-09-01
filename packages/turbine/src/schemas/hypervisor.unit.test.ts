import { describe, expect, test } from "vitest";
import { HypervisorDataSchema } from "./index";

/**
 * Réponse réelle du superviseur balena pendant une mise à jour : les images en
 * cours de téléchargement n'ont pas encore de `dockerImageId`, et celles déjà
 * présentes n'ont pas de `downloadProgress`.
 */
const status_while_updating = {
	status: "success",
	appState: "applying",
	overallDownloadProgress: 42,
	containers: [
		{
			status: "Running",
			serviceName: "nuster-turbine",
			appId: 1,
			imageId: 10,
			serviceId: 100,
			containerId: "abc123",
			createdAt: "2026-09-01T13:54:00.000Z",
		},
	],
	images: [
		{ name: "nusterkit/turbine:2.4.0-beta.9", appId: 1, serviceName: "nuster-turbine", imageId: 11, status: "Downloading", downloadProgress: 42 },
		{ name: "nusterkit/ui:2.4.0-beta.9", appId: 1, serviceName: "nuster-ui", imageId: 12, status: "Downloading", downloadProgress: 7 },
	],
	release: "5cb11c8",
};

describe("HypervisorDataSchema", () => {
	test("accepte les images encore en téléchargement, sans dockerImageId", () => {
		// Exiger `dockerImageId` faisait échouer la sérialisation de `/machine`
		// pendant toute la durée d'une mise à jour, avec un 500 « Response doesn't
		// match the schema » — au moment précis où l'écran doit montrer l'avancement.
		const result = HypervisorDataSchema.safeParse(status_while_updating);

		expect(result.success).toBe(true);
	});

	test("accepte aussi une image téléchargée, avec son dockerImageId", () => {
		const settled = {
			...status_while_updating,
			appState: "applied",
			images: [
				{
					name: "nusterkit/turbine:2.4.0-beta.9",
					appId: 1,
					serviceName: "nuster-turbine",
					imageId: 11,
					dockerImageId: "sha256:deadbeef",
					status: "Downloaded",
				},
			],
		};

		expect(HypervisorDataSchema.safeParse(settled).success).toBe(true);
	});
});
