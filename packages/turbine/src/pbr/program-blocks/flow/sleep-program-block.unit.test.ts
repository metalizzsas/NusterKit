import { describe, expect, test } from "vitest";
import { create_mock_pbr_context } from "../../test-utils";
import { SleepProgramBlock } from "./sleep-program-block";

describe("SleepProgramBlock parameters validation", () => {
	const sleep_time = 2;

	test(
		"SleepProgramBlock sleeps for the correct amount of time.",
		async () => {
			const ctx = create_mock_pbr_context();
			const sleep_program_block = new SleepProgramBlock({ sleep: sleep_time }, ctx);

			const time_start = performance.now();
			await sleep_program_block.execute();
			const time_end = performance.now();

			expect(time_end - time_start).toBeGreaterThanOrEqual(sleep_time * 1000);

			sleep_program_block.dispose();
		},
		sleep_time * 1500,
	);

	test("SleepProgramBlock sleeps for the correct time even with a pause", async () => {
		const ctx = create_mock_pbr_context();
		const sleep_program_block = new SleepProgramBlock({ sleep: sleep_time }, ctx);
		const pause_time = 1;

		setTimeout(() => ctx.pbr_emitter.emit("pause"), 500);
		setTimeout(() => ctx.pbr_emitter.emit("resume"), 1000 + pause_time * 1000);

		const time_start = performance.now();
		await sleep_program_block.execute();
		const time_end = performance.now();

		expect(time_end - time_start).toBeGreaterThanOrEqual(sleep_time * 1000 + pause_time * 1000);

		sleep_program_block.dispose();
	});
});

describe("SleepProgramBlock Events", () => {
	test("SleepProgramBlock registers listeners on pbr_emitter", () => {
		const ctx = create_mock_pbr_context();
		const block = new SleepProgramBlock({ sleep: 1 }, ctx);

		// ProgramBlock base registers: stop, status.update, pause, resume
		expect(ctx.pbr_emitter.listenerCount("stop")).toBeGreaterThanOrEqual(1);
		expect(ctx.pbr_emitter.listenerCount("pause")).toBeGreaterThanOrEqual(1);
		expect(ctx.pbr_emitter.listenerCount("resume")).toBeGreaterThanOrEqual(1);
		expect(ctx.pbr_emitter.listenerCount("status.update")).toBeGreaterThanOrEqual(1);

		block.dispose();
	});
});
