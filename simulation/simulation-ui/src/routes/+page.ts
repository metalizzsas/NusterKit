import type { PageLoad } from './$types';
import type { IOGates } from '@metalizzsas/nuster-typings/build/spec/iogates';

export const load: PageLoad = async ({ fetch }) => {
	const req = await fetch('http://127.0.0.1:4081/io');
	const gates = (await req.json()) as IOGates[];

	return {
		gates
	};
};
