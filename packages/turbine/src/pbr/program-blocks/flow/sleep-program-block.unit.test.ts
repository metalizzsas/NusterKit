import { test, expect, describe } from "vitest";
import { SleepProgramBlock } from "./sleep-program-block";
import { createMockPBRContext } from "../../test-utils";

describe("SleepProgramBlock parameters validation", () => {
	const sleepTime = 2;

	test("SleepProgramBlock sleeps for the correct amount of time.", async () => {
		const ctx = createMockPBRContext();
		const sleepProgramBlock = new SleepProgramBlock({ sleep: sleepTime }, ctx);

		const timeStart = performance.now();
		await sleepProgramBlock.execute();
		const timeEnd = performance.now();

		expect(timeEnd - timeStart).toBeGreaterThanOrEqual(sleepTime * 1000);

		sleepProgramBlock.dispose();
	}, sleepTime * 1500);

	test("SleepProgramBlock sleeps for the correct time even with a pause", async () => {
		const ctx = createMockPBRContext();
		const sleepProgramBlock = new SleepProgramBlock({ sleep: sleepTime }, ctx);
		const pauseTime = 1;

		setTimeout(() => ctx.pbrEmitter.emit("pause"), 500);
		setTimeout(() => ctx.pbrEmitter.emit("resume"), 1000 + pauseTime * 1000);

		const timeStart = performance.now();
		await sleepProgramBlock.execute();
		const timeEnd = performance.now();

		expect(timeEnd - timeStart).toBeGreaterThanOrEqual(sleepTime * 1000 + pauseTime * 1000);

		sleepProgramBlock.dispose();
	});
});

describe("SleepProgramBlock Events", () => {
	test("SleepProgramBlock registers listeners on pbrEmitter", () => {
		const ctx = createMockPBRContext();
		const block = new SleepProgramBlock({ sleep: 1 }, ctx);

		// ProgramBlock base registers: stop, status.update, pause, resume
		expect(ctx.pbrEmitter.listenerCount("stop")).toBeGreaterThanOrEqual(1);
		expect(ctx.pbrEmitter.listenerCount("pause")).toBeGreaterThanOrEqual(1);
		expect(ctx.pbrEmitter.listenerCount("resume")).toBeGreaterThanOrEqual(1);
		expect(ctx.pbrEmitter.listenerCount("status.update")).toBeGreaterThanOrEqual(1);

		block.dispose();
	});
});
