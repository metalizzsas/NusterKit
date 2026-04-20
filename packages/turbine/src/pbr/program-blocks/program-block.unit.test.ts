import { describe, expect, test } from "vitest";
import { create_mock_pbr_context } from "../test-utils";
import { ProgramBlock } from "./program-block";

describe("ProgramBlock dispose()", () => {
	test("listener count returns to baseline after dispose", () => {
		const ctx = create_mock_pbr_context();

		const block = new ProgramBlock({ test: true } as never, ctx);
		expect(ctx.pbr_emitter.listenerCount("stop")).toBe(1);
		expect(ctx.pbr_emitter.listenerCount("status.update")).toBe(1);
		expect(ctx.pbr_emitter.listenerCount("pause")).toBe(1);
		expect(ctx.pbr_emitter.listenerCount("resume")).toBe(1);

		block.dispose();
		expect(ctx.pbr_emitter.listenerCount("stop")).toBe(0);
		expect(ctx.pbr_emitter.listenerCount("status.update")).toBe(0);
		expect(ctx.pbr_emitter.listenerCount("pause")).toBe(0);
		expect(ctx.pbr_emitter.listenerCount("resume")).toBe(0);
	});

	test("listener count stays correct across multiple instances", () => {
		const ctx = create_mock_pbr_context();

		const blocks = Array.from({ length: 5 }, () => new ProgramBlock({ test: true } as never, ctx));
		expect(ctx.pbr_emitter.listenerCount("stop")).toBe(5);

		for (const b of blocks) b.dispose();
		expect(ctx.pbr_emitter.listenerCount("stop")).toBe(0);
	});

	test("dispose does not remove other listeners on same events", () => {
		const ctx = create_mock_pbr_context();
		const external_listener = () => {};
		ctx.pbr_emitter.on("stop", external_listener);

		const block = new ProgramBlock({ test: true } as never, ctx);
		expect(ctx.pbr_emitter.listenerCount("stop")).toBe(2); // external + block

		block.dispose();
		expect(ctx.pbr_emitter.listenerCount("stop")).toBe(1); // only external remains

		ctx.pbr_emitter.off("stop", external_listener);
	});

	test("earlyExit is set to true when stop is emitted", () => {
		const ctx = create_mock_pbr_context();
		const block = new ProgramBlock({ test: true } as never, ctx);

		expect(block.earlyExit).toBe(false);
		ctx.pbr_emitter.emit("stop", "test-reason");
		expect(block.earlyExit).toBe(true);

		block.dispose();
	});

	test("paused flag toggles on pause/resume", () => {
		const ctx = create_mock_pbr_context();
		const block = new ProgramBlock({ test: true } as never, ctx);

		expect(block.paused).toBe(false);
		ctx.pbr_emitter.emit("pause");
		expect(block.paused).toBe(true);
		ctx.pbr_emitter.emit("resume");
		expect(block.paused).toBe(false);

		block.dispose();
	});
});
