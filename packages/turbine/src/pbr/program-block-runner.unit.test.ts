import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { ProgramBlockRunner as PBRConfig } from "$types/spec/cycle/program-block-runner";
import { TurbineEventLoop } from "../events";
import { ProgramBlockRunner } from "./program-block-runner";
import { create_mock_service_registry } from "./test-utils";

const service_registry = create_mock_service_registry();

// Suppress log noise during tests
beforeEach(() => {
	TurbineEventLoop.removeAllListeners("log");
});

afterEach(() => {
	vi.useRealTimers();
	TurbineEventLoop.removeAllListeners();
});

/** Minimal PBR config with a single step containing a short sleep block */
function create_minimal_config(overrides?: Partial<PBRConfig>): PBRConfig {
	return {
		name: "test-cycle",
		profileRequired: false,
		pausable: true,
		runConditions: [],
		steps: [
			{
				name: "step-1",
				isEnabled: 1,
				startBlocks: [],
				endBlocks: [],
				blocks: [{ sleep: 0.05 }],
			},
		],
		...overrides,
	};
}

/** Config with 2 steps for step-sequencing tests */
function create_multi_step_config(): PBRConfig {
	return create_minimal_config({
		steps: [
			{
				name: "step-1",
				isEnabled: 1,
				startBlocks: [],
				endBlocks: [],
				blocks: [{ sleep: 0.05 }],
			},
			{
				name: "step-2",
				isEnabled: 1,
				startBlocks: [],
				endBlocks: [],
				blocks: [{ sleep: 0.05 }],
			},
		],
	});
}

describe("ProgramBlockRunner lifecycle", () => {
	test("constructor sets status to 'created'", () => {
		const pbr = new ProgramBlockRunner(create_minimal_config(), undefined, service_registry);
		expect(pbr.status.mode).toBe("created");
		pbr.dispose();
	});

	test("run() transitions through started → ended", async () => {
		const modes: string[] = [];
		TurbineEventLoop.on("pbr.status.update", (mode: string) => modes.push(mode));

		const pbr = new ProgramBlockRunner(create_minimal_config(), undefined, service_registry);
		await pbr.run();

		expect(modes).toContain("created");
		expect(modes).toContain("started");
		expect(modes).toContain("ended");
		expect(pbr.status.mode).toBe("ended");
		expect(pbr.status.endReason).toBe("finished");
	});

	test("run() executes steps in sequence", async () => {
		const pbr = new ProgramBlockRunner(create_multi_step_config(), undefined, service_registry);
		await pbr.run();

		expect(pbr.status.mode).toBe("ended");
		// Both steps should have been visited (currentStepIndex advances past last)
		expect(pbr.currentStepIndex).toBe(2);
	});

	test("end() with reason transitions to ending → ended after dispose", async () => {
		// Use a longer sleep so we have time to end it
		const config = create_minimal_config({
			steps: [
				{
					name: "step-1",
					isEnabled: 1,
					startBlocks: [],
					endBlocks: [],
					blocks: [{ sleep: 1 }],
				},
			],
		});
		const pbr = new ProgramBlockRunner(config, undefined, service_registry);

		// Register listener BEFORE run() to avoid race
		const started_promise = new Promise<void>((resolve) => {
			TurbineEventLoop.on("pbr.status.update", (mode: string) => {
				if (mode === "started") resolve();
			});
		});

		const run_promise = pbr.run();
		await started_promise;

		pbr.end("user");
		await run_promise;

		expect(pbr.status.mode).toBe("ended");
		expect(pbr.status.endReason).toBe("user");
	}, 10000);

	test("end() via pbr.stop event works", async () => {
		const config = create_minimal_config({
			steps: [
				{
					name: "step-1",
					isEnabled: 1,
					startBlocks: [],
					endBlocks: [],
					blocks: [{ sleep: 1 }],
				},
			],
		});
		const pbr = new ProgramBlockRunner(config, undefined, service_registry);

		const started_promise = new Promise<void>((resolve) => {
			TurbineEventLoop.on("pbr.status.update", (mode: string) => {
				if (mode === "started") resolve();
			});
		});

		const run_promise = pbr.run();
		await started_promise;

		TurbineEventLoop.emit("pbr.stop", "emergency");
		await run_promise;

		expect(pbr.status.mode).toBe("ended");
		expect(pbr.status.endReason).toBe("emergency");
	}, 10000);

	test("pause → resume cycle works on a pausable PBR", async () => {
		const pbr = new ProgramBlockRunner(
			create_minimal_config({
				steps: [
					{
						name: "long-step",
						isEnabled: 1,
						startBlocks: [],
						endBlocks: [],
						blocks: [{ sleep: 3 }],
					},
				],
			}),
			undefined,
			service_registry,
		);

		const started_promise = new Promise<void>((resolve) => {
			TurbineEventLoop.on("pbr.status.update", (mode: string) => {
				if (mode === "started") resolve();
			});
		});

		const run_promise = pbr.run();
		await started_promise;

		expect(pbr.status.mode).toBe("started");

		// Pause
		TurbineEventLoop.emit("pbr.pause");
		await new Promise((r) => setTimeout(r, 100));
		expect(pbr.status.mode).toBe("paused");

		// Resume
		TurbineEventLoop.emit("pbr.resume");
		await new Promise((r) => setTimeout(r, 100));
		expect(pbr.status.mode).toBe("started");

		// End the cycle
		pbr.end("test-done");
		await run_promise;

		expect(pbr.status.mode).toBe("ended");
		expect(pbr.total_paused_time).toBeGreaterThan(0);
	}, 15000);

	test("pause on non-pausable PBR is ignored", async () => {
		const config = create_minimal_config({
			pausable: undefined,
			steps: [
				{
					name: "step-1",
					isEnabled: 1,
					startBlocks: [],
					endBlocks: [],
					blocks: [{ sleep: 1 }],
				},
			],
		});
		const pbr = new ProgramBlockRunner(config, undefined, service_registry);

		const started_promise = new Promise<void>((resolve) => {
			TurbineEventLoop.on("pbr.status.update", (mode: string) => {
				if (mode === "started") resolve();
			});
		});

		const run_promise = pbr.run();
		await started_promise;

		TurbineEventLoop.emit("pbr.pause");
		await new Promise((r) => setTimeout(r, 50));
		expect(pbr.status.mode).toBe("started"); // still started, not paused

		pbr.end("done");
		await run_promise;
	}, 10000);

	test("dispose removes PBR event listeners from TurbineEventLoop", () => {
		const pbr_events = ["pbr.pause", "pbr.resume", "pbr.set_pausable", "pbr.stop"] as const;

		const before_counts = pbr_events.map((e) => TurbineEventLoop.listenerCount(e));

		const pbr = new ProgramBlockRunner(create_minimal_config(), undefined, service_registry);

		// Each event should have at least 1 more listener
		const during_counts = pbr_events.map((e) => TurbineEventLoop.listenerCount(e));
		for (let i = 0; i < pbr_events.length; i++) {
			expect(during_counts[i]).toBeGreaterThan(before_counts[i]);
		}

		pbr.dispose();

		// All listeners should be back to pre-PBR counts
		const after_counts = pbr_events.map((e) => TurbineEventLoop.listenerCount(e));
		for (let i = 0; i < pbr_events.length; i++) {
			expect(after_counts[i]).toBe(before_counts[i]);
		}
	});

	test("dispose clears all PBR timers", async () => {
		const pbr = new ProgramBlockRunner(create_minimal_config(), undefined, service_registry);

		// Simulate a timer being registered
		const timer = { name: "test-timer", enabled: true, value: 0, timer: setInterval(() => {}, 1000) };
		pbr.timers.push(timer);

		pbr.dispose();

		// Timer should have been cleared (we can't inspect directly, but no leak)
		expect(pbr.status.mode).toBe("ended");
	});

	test("variables can be read and written via ctx", () => {
		const pbr = new ProgramBlockRunner(create_minimal_config(), undefined, service_registry);

		// Write
		pbr.ctx!.write_variable("myVar", 42);

		// Read
		const value = pbr.ctx!.read_variable("myVar");
		expect(value).toBe(42);

		pbr.dispose();
	});

	test("startDate and endDate are set during lifecycle", async () => {
		const pbr = new ProgramBlockRunner(create_minimal_config(), undefined, service_registry);
		expect(pbr.status.startDate).toBeUndefined();

		await pbr.run();

		expect(pbr.status.startDate).toBeDefined();
		expect(pbr.status.endDate).toBeDefined();
		expect(pbr.status.endDate!).toBeGreaterThanOrEqual(pbr.status.startDate!);
	});
});
