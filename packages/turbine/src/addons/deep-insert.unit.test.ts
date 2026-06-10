import type { MachineSpecs } from "$types/index";
import { describe, expect, it } from "vitest";
import { deep_insert } from "./deep-insert";

// deep_insert only walks the object by path, so a partial shape cast to
// MachineSpecs is enough to exercise the behaviour under test.
function make_specs(): MachineSpecs {
	return {
		iogates: [
			{ name: "gate-a", bus: 1 },
			{ name: "gate-b", bus: 2 },
			{ name: "gate-c", bus: 3 },
		],
		nuster: {
			homeInformations: ["info-a", "info-b", "info-c"],
			keepMe: "value",
			dropMe: "gone",
		},
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} as any as MachineSpecs;
}

describe("deep_insert — remove mode", () => {
	it("removes array items matching an object criterion (partial match)", () => {
		const specs = deep_insert(make_specs(), [{ name: "gate-b" }], "iogates", "remove");
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect((specs as any).iogates.map((g: any) => g.name)).toEqual(["gate-a", "gate-c"]);
	});

	it("removes several array items matching multiple criteria", () => {
		const specs = deep_insert(make_specs(), [{ name: "gate-a" }, { name: "gate-c" }], "iogates", "remove");
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect((specs as any).iogates.map((g: any) => g.name)).toEqual(["gate-b"]);
	});

	it("removes primitive array items by equality", () => {
		const specs = deep_insert(make_specs(), ["info-b"], "nuster.homeInformations", "remove");
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect((specs as any).nuster.homeInformations).toEqual(["info-a", "info-c"]);
	});

	it("deletes object properties when the path points to an object", () => {
		const specs = deep_insert(make_specs(), ["dropMe"], "nuster", "remove");
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect((specs as any).nuster).not.toHaveProperty("dropMe");
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect((specs as any).nuster.keepMe).toBe("value");
	});

	it("leaves the array untouched when nothing matches", () => {
		const specs = deep_insert(make_specs(), [{ name: "gate-z" }], "iogates", "remove");
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect((specs as any).iogates).toHaveLength(3);
	});

	it("matches nested arrays as a prefix (io_write blocks by gate name)", () => {
		const specs = {
			cycleTypes: [
				{
					steps: [
						{
							startBlocks: [
								{ io_write: ["regulators#power", 1] },
								{ io_write: ["regulators#rd-pressure", { read_machine_var: "rd-pressure" }] },
								{ io_write: ["regulators#ox-pressure", 0] },
							],
						},
					],
				},
			],
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any as MachineSpecs;

		const result = deep_insert(
			specs,
			[{ io_write: ["regulators#rd-pressure"] }, { io_write: ["regulators#ox-pressure"] }],
			"cycleTypes.0.steps.0.startBlocks",
			"remove",
		);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		expect((result as any).cycleTypes[0].steps[0].startBlocks).toEqual([{ io_write: ["regulators#power", 1] }]);
	});
});
