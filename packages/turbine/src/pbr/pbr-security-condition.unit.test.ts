import { EventEmitter } from "node:events";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { PBRRunCondition } from "./pbr-security-condition";

/** Contexte PBR minimal : un bus io, un bus bacs, un émetteur d'état, un logger. */
const make_ctx = () => {
	const bus = new EventEmitter();
	const gates = new Map<string, number>();
	const containers = { act: { name: "act", productData: { loadedProductType: "activant", loadDate: "", lifetimeRemaining: 1000 } } };

	return {
		bus,
		gates,
		read_calls: 0,
		fail_reads: 0,
		ctx: {
			io: {
				get_gate_value: (name: string) => gates.get(name),
				on: (event: string, cb: (...a: never[]) => void) => bus.on(`io.${event}`, cb),
				off: (event: string, cb: (...a: never[]) => void) => bus.off(`io.${event}`, cb),
			},
			containers: {
				on: (event: string, cb: (...a: never[]) => void) => bus.on(`container.${event}`, cb),
				off: (event: string, cb: (...a: never[]) => void) => bus.off(`container.${event}`, cb),
				read: async function (this: { fail_reads: number; read_calls: number }, name: string) {
					return containers[name as keyof typeof containers];
				},
			},
			pbr_emitter: new EventEmitter(),
			logger: { log: () => {} },
		},
	};
};

describe("PBRRunCondition", () => {
	let h: ReturnType<typeof make_ctx>;

	beforeEach(() => {
		h = make_ctx();
	});

	test("une condition io part de la valeur courante de la gate, pas de « error »", () => {
		h.gates.set("cover-closed", 1);

		const condition = new PBRRunCondition(
			{ name: "cover", startOnly: false, checkchain: { io: { gateName: "cover-closed", gateValue: 1 } } } as never,
			undefined,
			h.ctx as never,
		);

		// Avant, l'état restait "error" jusqu'au prochain tick du scanner io — et
		// pour toujours si une lecture échouait entre-temps.
		expect(condition.state).toBe("good");

		condition.dispose();
	});

	test("une condition produit dont la lecture initiale échoue réessaie jusqu'à réussir", async () => {
		vi.useFakeTimers();

		try {
			let attempts = 0;
			h.ctx.containers.read = async (name: string) => {
				attempts++;
				// Les deux premières lectures tombent — base occupée au démarrage.
				if (attempts <= 2) throw new Error("Socket timeout");
				return { name, productData: { loadedProductType: "activant", loadDate: "", lifetimeRemaining: 1000 } } as never;
			};

			const condition = new PBRRunCondition(
				{ name: "act-loaded", startOnly: false, checkchain: { parameter: { product_status: "act" } } } as never,
				undefined,
				h.ctx as never,
			);

			await vi.advanceTimersByTimeAsync(0);
			expect(condition.state).toBe("error");

			// Avant, rien ne réessayait : la condition restait rouge jusqu'à ce qu'on
			// touche au bac. Après deux échecs (1 s puis 2 s), la troisième aboutit.
			await vi.advanceTimersByTimeAsync(1_000);
			await vi.advanceTimersByTimeAsync(2_000);

			expect(attempts).toBe(3);
			expect(condition.state).toBe("good");

			condition.dispose();
		} finally {
			vi.useRealTimers();
		}
	});

	test("dispose retire l'écouteur du bac", async () => {
		const condition = new PBRRunCondition(
			{ name: "act-loaded", startOnly: false, checkchain: { parameter: { product_status: "act" } } } as never,
			undefined,
			h.ctx as never,
		);
		await new Promise((r) => setTimeout(r, 0));

		// Chaque création de cycle laissait un écouteur `container.updated` de plus.
		expect(h.bus.listenerCount("container.updated.act")).toBe(1);
		condition.dispose();
		expect(h.bus.listenerCount("container.updated.act")).toBe(0);
	});
});
