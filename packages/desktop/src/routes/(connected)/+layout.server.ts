import { env } from '$env/dynamic/private';
import type { Status } from '@metalizzsas/nuster-turbine/types';

export const load = async ({ locals }) => {

    const settingsRequest = await fetch(`http://${env.TURBINE_ADDRESS}/settings`);
    const realtimeDataRequest = await fetch(`http://${env.TURBINE_ADDRESS}/realtime`);

    const { dark, lang } = await settingsRequest.json() as { dark: "1" | "0", lang: string };
    
    const realtimeData = await realtimeDataRequest.json() as Status;

    /// - Tranfer locals from hook to pages
    return {

        is_machine_screen: locals.is_machine_screen,
        machine_configuration: locals.machine_configuration,

        settings: {
            dark: parseInt(dark),
            lang
        },
        machine_status: realtimeData
    };
    
};