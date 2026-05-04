import type { IOGates } from "@nuster/turbine/types/spec/iogates";

import { env } from "$env/dynamic/private";

export type SimulationGate = IOGates & { value: number; category?: string; locked?: boolean };

export const load = async ({ fetch }) => {
	try {
		const req = await fetch(`${env.SIMULATION_URL}/io`);
		if (req.ok) {
			const gates = (await req.json()) as SimulationGate[];
			return { gates, connected: true };
		}
	} catch {
		// simulation-server offline
	}
	return { gates: [] as SimulationGate[], connected: false };
};
