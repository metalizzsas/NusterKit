import { beforeEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	/** Transactions ouvertes — chacune coûte un fsync sur l'eMMC de la machine */
	transactions: 0,
	/** Écritures lancées hors transaction */
	standalone_writes: 0,
	/** Opérations empilées dans la dernière transaction */
	batched: 0,
}));

const write = (kind: string) => async (args: unknown) => {
	mocks.standalone_writes++;
	return { kind, args, id: "id" };
};

vi.mock("../db", () => ({
	prisma: {
		$transaction: async (operations: unknown[]) => {
			mocks.transactions++;
			mocks.batched = operations.length;
			// Les opérations comptées comme "standalone" au moment où elles ont été
			// construites font en réalité partie du lot : on les rend au batch.
			mocks.standalone_writes -= operations.length;
			return operations;
		},
		profile: { deleteMany: write("deleteMany"), create: write("create") },
		profileValue: { create: write("profileValue.create") },
	},
}));

const { ProfilesRouter } = await import("./profiles-router");

// Quatre profils préfaits et 79 valeurs, comme metalfog-m-2.
const premades = Array.from({ length: 4 }, (_, i) => ({
	id: `premade-${i}`,
	name: `Premade ${i}`,
	skeleton: "metalfog",
	values: Array.from({ length: 20 }, (_, j) => ({ key: `field-${j}`, value: j })),
}));

describe("ProfilesRouter premade seeding", () => {
	beforeEach(() => {
		mocks.transactions = 0;
		mocks.standalone_writes = 0;
		mocks.batched = 0;
	});

	test("sème les profils préfaits en une seule transaction", async () => {
		// Le semis part du constructeur : on instancie pour l'observer.
		new ProfilesRouter([], premades as never);

		// Le semis est lancé sans être attendu depuis le constructeur.
		await vi.waitFor(() => expect(mocks.transactions).toBe(1));

		// Une écriture par valeur, chacune attendue à son tour, monopolisait la
		// connexion SQLite unique pendant plusieurs secondes au démarrage — et tout
		// ce qui arrivait derrière expirait en `Socket timeout`.
		expect(mocks.standalone_writes).toBe(0);

		// deleteMany + un create par profil : les valeurs partent en imbriqué.
		expect(mocks.batched).toBe(1 + premades.length);
	});
});
