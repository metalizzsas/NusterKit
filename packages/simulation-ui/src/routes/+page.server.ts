import type { IOGates } from "@nuster/turbine/types/spec/iogates";

import { env } from "$env/dynamic/private";
import { fail } from '@sveltejs/kit';

export const load = async ({ fetch }) => {
	const req = await fetch(`http://${env.SIMULATION_ADDRESS}:${env.SIMULATION_PORT}/io`);
	const gates = (await req.json()) as IOGates[];

	return {
		gates
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

		const updateGateRequest = await fetch(`http://${env.SIMULATION_ADDRESS}:${env.SIMULATION_PORT}/io/${gate.replace("#", "_")}/${final_value}`, { method: "post" });

		if(updateGateRequest.status !== 200 || !updateGateRequest.ok)
			return fail(400, { message: "Failed to update gate value" });

		return { message: "Successfully updated gate value" };
	}
}