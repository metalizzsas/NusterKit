import type { IMaintenanceHydrated } from '@metalizzsas/nuster-typings/build/hydrated/maintenance';
import type { IMaintenanceProcedure } from '@metalizzsas/nuster-typings/build/spec/maintenance';
import type { PageLoad } from './$types';

export const load: PageLoad = async (ctx) => {
	const maintenanceTaskRequest = await ctx.fetch(`//${(window.localStorage.getItem('ip') ?? '127.0.0.1')}/api/v1/maintenance/${ctx.params.id}`);
	const maintenanceProcedureRequest = await ctx.fetch(`//${window.localStorage.getItem('ip') ?? '127.0.0.1'}/api/v1/maintenance/${ctx.params.id}/procedure`);

	const maintenanceTaskData = await maintenanceTaskRequest.json() as IMaintenanceHydrated;
	const maintenanceProcedureData = await maintenanceProcedureRequest.json() as IMaintenanceProcedure;

	return { 
		maintenance: maintenanceTaskData,
		procedure: maintenanceProcedureData
	};
};
