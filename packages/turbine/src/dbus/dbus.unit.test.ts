import { beforeEach, describe, expect, test, vi } from "vitest";

type InvokeCallback = (error: unknown, response?: unknown) => void;

const mocks = vi.hoisted(() => ({
	/** Nombre de connexions ouvertes depuis le début du test */
	buses: 0,
	/** Si false, `invoke` ne rappelle jamais son callback — socket morte */
	answers: true,
	/** Handlers 'error' / 'end' enregistrés sur la dernière connexion */
	handlers: new Map<string, (err?: Error) => void>(),
}));

vi.mock("@homebridge/dbus-native", () => ({
	systemBus: () => {
		mocks.buses++;
		mocks.handlers = new Map();

		return {
			connection: {
				on: (event: string, cb: (err?: Error) => void) => {
					mocks.handlers.set(event, cb);
				},
			},
			invoke: (_message: unknown, callback: InvokeCallback) => {
				if (mocks.answers) callback(null, ["ok"]);
			},
		};
	},
}));

const { DBusClient } = await import("./dbus");

describe("DBusClient", () => {
	beforeEach(() => {
		mocks.buses = 0;
		mocks.answers = true;
		vi.useRealTimers();
	});

	test("un appel sans réponse échoue au lieu de rester pendant", async () => {
		vi.useFakeTimers();

		const client = new DBusClient();
		mocks.answers = false;

		const call = client.dbusInvoker({ destination: "org.freedesktop.NetworkManager", path: "/", member: "GetDevices" });
		// Sans le délai de garde, cette promesse ne se résolvait jamais : la page
		// /settings/network attendait jusqu'au timeout du client, puis rendait 500.
		const assertion = expect(call).rejects.toThrow(/timed out/);

		await vi.advanceTimersByTimeAsync(10_000);
		await assertion;

		vi.useRealTimers();
	});

	test("une connexion morte est remplacée à la requête suivante", async () => {
		const client = new DBusClient();
		expect(mocks.buses).toBe(1);

		// Le bus ferme la connexion — c'est l'EPIPE observé sur la machine.
		mocks.handlers.get("error")?.(new Error("write EPIPE"));

		// La requête suivante doit rouvrir une connexion, et aboutir.
		await expect(client.dbusInvoker({ destination: "org.freedesktop.NetworkManager", path: "/", member: "GetDevices" })).resolves.toEqual(["ok"]);
		expect(mocks.buses).toBe(2);
	});

	test("un appel qui expire jette la connexion", async () => {
		vi.useFakeTimers();

		const client = new DBusClient();
		mocks.answers = false;

		const call = client.dbusInvoker({ destination: "org.freedesktop.NetworkManager", path: "/", member: "GetDevices" });
		const assertion = expect(call).rejects.toThrow(/timed out/);
		await vi.advanceTimersByTimeAsync(10_000);
		await assertion;

		vi.useRealTimers();

		// La socket ne répondait plus : le prochain appel ne doit pas la réutiliser.
		mocks.answers = true;
		await expect(client.dbusInvoker({ destination: "org.freedesktop.NetworkManager", path: "/", member: "GetDevices" })).resolves.toEqual(["ok"]);
		expect(mocks.buses).toBe(2);
	});
});
