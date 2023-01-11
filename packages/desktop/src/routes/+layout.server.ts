import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals }) => {

    /// - Tranfer locals from hook to pages
    return {
        nuster_api_host: locals.nuster_api_host,
        nuster_ws_host: locals.nuster_ws_host,
        is_machine_screen: locals.is_machine_screen
    };
    
}) satisfies LayoutServerLoad;