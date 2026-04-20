import { test, expect, describe } from "vitest";
import { ScopedEmitter } from "./scoped-emitter";

type TestEvents = {
	"foo": (value: number) => void;
	"bar": (a: string, b: boolean) => void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key: string]: (...args: any[]) => void;
}

describe("ScopedEmitter", () => {
	test("on/emit delivers events to listeners", () => {
		const emitter = new ScopedEmitter<TestEvents>();
		let received: number | undefined;

		emitter.on("foo", (value) => { received = value; });
		emitter.emit("foo", 42);

		expect(received).toBe(42);
	});

	test("off removes a specific listener", () => {
		const emitter = new ScopedEmitter<TestEvents>();
		let callCount = 0;
		const listener = () => { callCount++; };

		emitter.on("foo", listener);
		emitter.emit("foo", 1);
		expect(callCount).toBe(1);

		emitter.off("foo", listener);
		emitter.emit("foo", 2);
		expect(callCount).toBe(1); // not called again
	});

	test("dispose removes ALL listeners", () => {
		const emitter = new ScopedEmitter<TestEvents>();
		let fooCalls = 0;
		let barCalls = 0;

		emitter.on("foo", () => { fooCalls++; });
		emitter.on("bar", () => { barCalls++; });

		expect(emitter.listenerCount("foo")).toBe(1);
		expect(emitter.listenerCount("bar")).toBe(1);

		emitter.dispose();

		expect(emitter.listenerCount("foo")).toBe(0);
		expect(emitter.listenerCount("bar")).toBe(0);

		// Events after dispose are silently ignored
		emitter.emit("foo", 1);
		emitter.emit("bar", "x", true);
		expect(fooCalls).toBe(0);
		expect(barCalls).toBe(0);
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

		emitter.on("foo", () => { order.push(1); });
		emitter.on("foo", () => { order.push(2); });
		emitter.on("foo", () => { order.push(3); });

		emitter.emit("foo", 0);
		expect(order).toEqual([1, 2, 3]);
		expect(emitter.listenerCount("foo")).toBe(3);
	});

	test("multi-arg events pass all arguments", () => {
		const emitter = new ScopedEmitter<TestEvents>();
		let receivedA: string | undefined;
		let receivedB: boolean | undefined;

		emitter.on("bar", (a, b) => { receivedA = a; receivedB = b; });
		emitter.emit("bar", "hello", true);

		expect(receivedA).toBe("hello");
		expect(receivedB).toBe(true);
	});
});
