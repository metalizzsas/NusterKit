import { beforeEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({ alive: false, socket_open: false, timeout_ms: 0, hang_writes: false }));

vi.mock("ping", () => ({
	default: { sys: { probe: (_ip: string, cb: (alive: boolean) => void) => cb(mocks.alive) } },
}));

vi.mock("modbus-serial", () => ({
	default: class {
		get isOpen() {
			return mocks.socket_open;
		}
		async connectTCP() {
			mocks.socket_open = mocks.alive;
		}
		setTimeout(ms: number) {
			mocks.timeout_ms = ms;
		}
		async readCoils() {
			return { data: [true] };
		}
		async writeCoil() {
			// Simule l'expiration que modbus-serial lève quand `setTimeout` est posé.
			if (mocks.hang_writes) throw new Error("Timed out");
		}
		async readHoldingRegisters() {
			return { data: [42] };
		}
		close(cb?: () => void) {
			mocks.socket_open = false;
			cb?.();
		}
	},
}));

const { WAGO } = await import("./wago");

describe("WAGO controller availability", () => {
	beforeEach(() => {
		mocks.alive = false;
		mocks.socket_open = false;
		mocks.timeout_ms = 0;
		mocks.hang_writes = false;
	});

	test("une requête Modbus a un délai de réponse", () => {
		// Sans lui, modbus-serial attend indéfiniment : une écriture sur une
		// connexion à demi ouverte tenait le mutex pour toujours et figeait toutes
		// les E/S du WAGO — sur machine, cinq minutes jusqu'au stepOvertime.
		const wago = new WAGO("10.0.0.1");
		expect(mocks.timeout_ms).toBeGreaterThan(0);
		wago.dispose();
	});

	test("une écriture qui expire libère le mutex et fait tomber la connexion", async () => {
		mocks.alive = true;
		const wago = new WAGO("10.0.0.1");
		await vi.waitFor(() => expect(wago.connected).toBe(true));

		mocks.hang_writes = true;
		await expect(wago.writeData(3, 1)).rejects.toThrow(/Timed out/);

		// Le socket est fermé pour que le keepalive relance la reconnexion…
		expect(wago.connected).toBe(false);
		expect(mocks.socket_open).toBe(false);

		// …et la requête suivante n'attend pas derrière un mutex jamais rendu.
		mocks.hang_writes = false;
		await expect(wago.readData(1, "bit")).resolves.toBe(1);

		wago.dispose();
	});

	test("a single failed ping does not permanently disable the controller", async () => {
		// L'automate ne répond pas au démarrage : le constructeur tente de se connecter.
		const wago = new WAGO("10.0.0.1");
		await vi.waitFor(() => expect(wago.unreachable).toBe(true));

		// Il revient — une microcoupure réseau, un switch qui renégocie, un redémarrage bref.
		mocks.alive = true;

		// Une nouvelle tentative doit aboutir.
		await expect(wago.connect()).resolves.toBe(true);
		expect(wago.unreachable).toBe(false);

		// Et les lectures doivent rendre la valeur réelle, pas le 0 de repli.
		await expect(wago.readData(1, "bit")).resolves.toBe(1);

		wago.dispose();
	});
});
