import { describe, expect, test } from "vitest";
import { ScopedEmitter } from "./scoped-emitter";

type TestEvents = {
	foo: (value: number) => void;
	bar: (a: string, b: boolean) => void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key: string]: (...args: any[]) => void;
};

describe("ScopedEmitter", () => {
	test("on/emit delivers events to listeners", () => {
		const emitter = new ScopedEmitter<TestEvents>();
		let received: number | undefined;

		emitter.on("foo", (value) => {
			received = value;
		});
		emitter.emit("foo", 42);

		expect(received).toBe(42);
	});

	test("off removes a specific listener", () => {
		const emitter = new ScopedEmitter<TestEvents>();
		let call_count = 0;
		const listener = () => {
			call_count++;
		};

		emitter.on("foo", listener);
		emitter.emit("foo", 1);
		expect(call_count).toBe(1);

		emitter.off("foo", listener);
		emitter.emit("foo", 2);
		expect(call_count).toBe(1); // not called again
	});

	test("dispose removes ALL listeners", () => {
		const emitter = new ScopedEmitter<TestEvents>();
		let foo_calls = 0;
		let bar_calls = 0;

		emitter.on("foo", () => {
			foo_calls++;
		});
		emitter.on("bar", () => {
			bar_calls++;
		});

		expect(emitter.listenerCount("foo")).toBe(1);
		expect(emitter.listenerCount("bar")).toBe(1);

		emitter.dispose();

		expect(emitter.listenerCount("foo")).toBe(0);
		expect(emitter.listenerCount("bar")).toBe(0);

		// Events after dispose are silently ignored
		emitter.emit("foo", 1);
		emitter.emit("bar", "x", true);
		expect(foo_calls).toBe(0);
		expect(bar_calls).toBe(0);
	});

	test("on after dispose is silently ignored", () => {
		const emitter = new ScopedEmitter<TestEvents>();
		emitter.dispose();

		emitter.on("foo", () => {});
		expect(emitter.listenerCount("foo")).toBe(0);
	});

	test("multiple listeners on same event", () => {
		const emitter = new ScopedEmitter<TestEvents>();
		const order: number[] = [];

		emitter.on("foo", () => {
			order.push(1);
		});
		emitter.on("foo", () => {
			order.push(2);
		});
		emitter.on("foo", () => {
			order.push(3);
		});

		emitter.emit("foo", 0);
		expect(order).toEqual([1, 2, 3]);
		expect(emitter.listenerCount("foo")).toBe(3);
	});

	test("multi-arg events pass all arguments", () => {
		const emitter = new ScopedEmitter<TestEvents>();
		let received_a: string | undefined;
		let received_b: boolean | undefined;

		emitter.on("bar", (a, b) => {
			received_a = a;
			received_b = b;
		});
		emitter.emit("bar", "hello", true);

		expect(received_a).toBe("hello");
		expect(received_b).toBe(true);
	});
});
