import type { ConfigModel, ConfigVariant, IConfiguration } from '@metalizzsas/nuster-typings/build/configuration';
import type { PageLoad } from './$types';

type models = `${ConfigModel}/${ConfigVariant}/${number}`;

export const load: PageLoad = async (ctx) => {
	
    const machineModelsRequest = await ctx.fetch(`//${window.localStorage.getItem('ip') ?? '127.0.0.1'}/config`);
	const actualMachineConfig = await ctx.fetch(`//${window.localStorage.getItem('ip') ?? '127.0.0.1'}/config/actual`)

    const machineModelsJson = await machineModelsRequest.json() as {[x: models]: IConfiguration};
	const actualMachineConfigJson = (actualMachineConfig.status == 200) ? await actualMachineConfig.json() as IConfiguration  : undefined;

	return {
		machineModelsJson,
		actualMachineConfigJson
	};
};
