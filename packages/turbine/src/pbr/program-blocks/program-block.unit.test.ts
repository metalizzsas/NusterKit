import { test, expect, describe } from "vitest";
import { ProgramBlock } from "./program-block";
import { createMockPBRContext } from "../test-utils";

describe("ProgramBlock dispose()", () => {
	test("listener count returns to baseline after dispose", () => {
		const ctx = createMockPBRContext();

		const block = new ProgramBlock({ test: true } as never, ctx);
		expect(ctx.pbrEmitter.listenerCount("stop")).toBe(1);
		expect(ctx.pbrEmitter.listenerCount("status.update")).toBe(1);
		expect(ctx.pbrEmitter.listenerCount("pause")).toBe(1);
		expect(ctx.pbrEmitter.listenerCount("resume")).toBe(1);

		block.dispose();
		expect(ctx.pbrEmitter.listenerCount("stop")).toBe(0);
		expect(ctx.pbrEmitter.listenerCount("status.update")).toBe(0);
		expect(ctx.pbrEmitter.listenerCount("pause")).toBe(0);
		expect(ctx.pbrEmitter.listenerCount("resume")).toBe(0);
	});

	test("listener count stays correct across multiple instances", () => {
		const ctx = createMockPBRContext();

		const blocks = Array.from({ length: 5 }, () => new ProgramBlock({ test: true } as never, ctx));
		expect(ctx.pbrEmitter.listenerCount("stop")).toBe(5);

		for (const b of blocks) b.dispose();
		expect(ctx.pbrEmitter.listenerCount("stop")).toBe(0);
	});

	test("dispose does not remove other listeners on same events", () => {
		const ctx = createMockPBRContext();
		const externalListener = () => {};
		ctx.pbrEmitter.on("stop", externalListener);

		const block = new ProgramBlock({ test: true } as never, ctx);
		expect(ctx.pbrEmitter.listenerCount("stop")).toBe(2); // external + block

		block.dispose();
		expect(ctx.pbrEmitter.listenerCount("stop")).toBe(1); // only external remains

		ctx.pbrEmitter.off("stop", externalListener);
	});

	test("earlyExit is set to true when stop is emitted", () => {
		const ctx = createMockPBRContext();
		const block = new ProgramBlock({ test: true } as never, ctx);

		expect(block.earlyExit).toBe(false);
		ctx.pbrEmitter.emit("stop", "test-reason");
		expect(block.earlyExit).toBe(true);

		block.dispose();
	});

	test("paused flag toggles on pause/resume", () => {
		const ctx = createMockPBRContext();
		const block = new ProgramBlock({ test: true } as never, ctx);

		expect(block.paused).toBe(false);
		ctx.pbrEmitter.emit("pause");
		expect(block.paused).toBe(true);
		ctx.pbrEmitter.emit("resume");
		expect(block.paused).toBe(false);

		block.dispose();
	});
});
