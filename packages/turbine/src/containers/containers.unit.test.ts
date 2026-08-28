import { beforeEach, describe, expect, test, vi } from "vitest";

type Row = { name: string; loadedProductType: string; loadDate: Date };

const mocks = vi.hoisted(() => ({
	rows: new Map<string, Row>(),
	find_calls: 0,
}));

vi.mock("../db", () => ({
	prisma: {
		container: {
			findUnique: async ({ where }: { where: { name: string } }) => {
				mocks.find_calls++;
				return mocks.rows.get(where.name) ?? null;
			},
			create: async ({ data }: { data: { name: string; loadedProductType: string; loadDate: string } }) => {
				const row = { name: data.name, loadedProductType: data.loadedProductType, loadDate: new Date(data.loadDate) };
				mocks.rows.set(row.name, row);
				return row;
			},
			update: async ({ where, data }: { where: { name: string }; data: { loadedProductType: string; loadDate: string } }) => {
				const row = { name: where.name, loadedProductType: data.loadedProductType, loadDate: new Date(data.loadDate) };
				mocks.rows.set(row.name, row);
				return row;
			},
			delete: async ({ where }: { where: { name: string } }) => {
				if (!mocks.rows.delete(where.name)) throw new Error("Record to delete does not exist.");
			},
		},
	},
}));

const { Container } = await import("./containers");

const make_container = () => new Container({ name: "act", type: "tank", supportedProductSeries: ["activant"] }, { activant: { lifespan: 30 } });

describe("Container product data", () => {
	beforeEach(() => {
		mocks.rows.clear();
		mocks.find_calls = 0;
	});

	test("diffuser le statut en boucle n'interroge la base qu'une fois", async () => {
		// Le bac est chargé depuis un précédent démarrage.
		mocks.rows.set("act", { name: "act", loadedProductType: "activant", loadDate: new Date() });

		const container = make_container();

		const first = await container.socket_data();
		expect(first.productData?.loadedProductType).toBe("activant");
		expect(mocks.find_calls).toBe(1);

		// Chaque signal `ws.dirty` reconstruit le statut. Sur SQLite, une seule
		// connexion sert toutes les requêtes : les relire à ce rythme les fait
		// s'empiler jusqu'au `Socket timeout`.
		for (let i = 0; i < 20; i++) await container.socket_data();

		expect(mocks.find_calls).toBe(1);

		container.dispose();
	});

	test("plusieurs clients connectés au même instant ne déclenchent qu'une requête", async () => {
		// Au démarrage, le kiosk et l'UI se connectent ensemble et réclament
		// chacun un statut complet, pendant que le disque est encore occupé.
		mocks.rows.set("act", { name: "act", loadedProductType: "activant", loadDate: new Date() });

		const container = make_container();

		await Promise.all(Array.from({ length: 8 }, () => container.socket_data()));

		expect(mocks.find_calls).toBe(1);

		container.dispose();
	});

	test("le cache suit les chargements et déchargements", async () => {
		const container = make_container();

		expect((await container.socket_data()).productData).toBeUndefined();
		await expect(container.is_product_loaded()).resolves.toBe(false);

		await container.load_product("activant");

		expect((await container.socket_data()).productData?.loadedProductType).toBe("activant");
		await expect(container.is_product_loaded()).resolves.toBe(true);
		// La base reste la source de vérité au redémarrage : elle doit être écrite.
		expect(mocks.rows.get("act")?.loadedProductType).toBe("activant");

		await container.unload_product();

		expect((await container.socket_data()).productData).toBeUndefined();
		await expect(container.is_product_loaded()).resolves.toBe(false);
		expect(mocks.rows.has("act")).toBe(false);

		container.dispose();
	});

	test("le temps de vie restant continue de décroître sans nouvelle requête", async () => {
		vi.useFakeTimers();
		try {
			vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
			mocks.rows.set("act", { name: "act", loadedProductType: "activant", loadDate: new Date("2026-01-01T00:00:00Z") });

			const container = make_container();

			const at_load = (await container.socket_data()).productData?.lifetimeRemaining ?? 0;

			vi.setSystemTime(new Date("2026-01-11T00:00:00Z"));
			const ten_days_later = (await container.socket_data()).productData?.lifetimeRemaining ?? 0;

			// C'est la donnée persistée qui est mise en cache, pas le calcul.
			expect(ten_days_later).toBeLessThan(at_load);
			expect(mocks.find_calls).toBe(1);

			container.dispose();
		} finally {
			vi.useRealTimers();
		}
	});
});
