import type { IOGates } from "@nuster/turbine/types/spec/iogates";

import { env } from "$env/dynamic/private";
import { fail } from '@sveltejs/kit';

export type SimulationGate = IOGates & { value: number; category?: string; locked?: boolean };

export const load = async ({ fetch }) => {
	let gates: SimulationGate[] = [];
	let revpi: { devicePath: string; bytes: string } | null = null;
	let connected = false;

	try {
		const req = await fetch(`${env.SIMULATION_URL}/io`);
		if (req.ok) {
			gates = (await req.json()) as SimulationGate[];
			connected = true;
		}
	} catch {
		// simulation-server offline — render the UI in disconnected state
	}

	try {
		const revpi_req = await fetch(`${env.SIMULATION_URL}/revpi`);
		if (revpi_req.ok) {
			revpi = (await revpi_req.json()) as { devicePath: string; bytes: string };
		}
	} catch {
		// RevPi controller not configured or server offline
	}

	return {
		gates,
		revpi,
		connected
	};
};


export const actions = {

	updateGateValue: async ({ request, fetch }) => {

		const form = await request.formData();

		const gate = form.get("gate")?.toString();
		const value = form.get("value")?.toString();

		const value_checked = form.has("value_checked") ? form.get("value_checked")?.toString() : undefined;

		let final_value = 0;

		if(value === undefined)
			final_value = value_checked === "on" ? 1 : 0;
		else
			final_value = Number(value);

		if(gate === undefined)
			return fail(400, { message: "Gate not found" });

		const updateGateRequest = await fetch(`${env.SIMULATION_URL}/io/${gate.replace("#", "_")}/${final_value}`, { method: "post" });

		if(updateGateRequest.status !== 200 || !updateGateRequest.ok)
			return fail(400, { message: "Failed to update gate value" });

		return { message: "Successfully updated gate value" };
	}
}
