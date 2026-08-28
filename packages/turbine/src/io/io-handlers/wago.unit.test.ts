import { beforeEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({ alive: false, socket_open: false }));

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
		async readCoils() {
			return { data: [true] };
		}
		async readHoldingRegisters() {
			return { data: [42] };
		}
		close(cb?: () => void) {
			cb?.();
		}
	},
}));

const { WAGO } = await import("./wago");

describe("WAGO controller availability", () => {
	beforeEach(() => {
		mocks.alive = false;
		mocks.socket_open = false;
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
