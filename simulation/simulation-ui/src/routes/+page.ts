import type { PageLoad } from './$types';
import type { IOGates } from "@nuster/turbine/types/spec/iogates";

export const load: PageLoad = async ({ fetch }) => {
	const req = await fetch('http://127.0.0.1:4082/io');
	const gates = (await req.json()) as IOGates[];

	return {
		gates
	};
};
