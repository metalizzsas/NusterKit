import { test, expect, describe, afterEach } from "vitest";
import { TurbineEventLoop } from "../../events";
import { ProgramBlock } from "./ProgramBlock";

afterEach(() => {
	// Safety cleanup in case a test fails mid-way
	TurbineEventLoop.removeAllListeners("pbr.stop");
	TurbineEventLoop.removeAllListeners("pbr.status.update");
	TurbineEventLoop.removeAllListeners("pbr.pause");
	TurbineEventLoop.removeAllListeners("pbr.resume");
});

describe("ProgramBlock dispose()", () => {
	test("listener count returns to baseline after dispose", () => {
		const baseline = TurbineEventLoop.listenerCount("pbr.stop");

		const block = new ProgramBlock({ test: true } as never);
		expect(TurbineEventLoop.listenerCount("pbr.stop")).toBe(baseline + 1);
		expect(TurbineEventLoop.listenerCount("pbr.status.update")).toBeGreaterThanOrEqual(1);
		expect(TurbineEventLoop.listenerCount("pbr.pause")).toBeGreaterThanOrEqual(1);
		expect(TurbineEventLoop.listenerCount("pbr.resume")).toBeGreaterThanOrEqual(1);

		block.dispose();
		expect(TurbineEventLoop.listenerCount("pbr.stop")).toBe(baseline);
	});

	test("listener count stays correct across multiple instances", () => {
		const baseline = TurbineEventLoop.listenerCount("pbr.stop");

		const blocks = Array.from({ length: 5 }, () => new ProgramBlock({ test: true } as never));
		expect(TurbineEventLoop.listenerCount("pbr.stop")).toBe(baseline + 5);

		for (const b of blocks) b.dispose();
		expect(TurbineEventLoop.listenerCount("pbr.stop")).toBe(baseline);
	});

	test("dispose does not remove other listeners on same events", () => {
		const externalListener = () => {};
		TurbineEventLoop.on("pbr.stop", externalListener);

		const block = new ProgramBlock({ test: true } as never);
		expect(TurbineEventLoop.listenerCount("pbr.stop")).toBe(2); // external + block

		block.dispose();
		expect(TurbineEventLoop.listenerCount("pbr.stop")).toBe(1); // only external remains

		TurbineEventLoop.removeListener("pbr.stop", externalListener);
	});
});
