import { env } from '$env/dynamic/private';

export const load = async ({ locals }) => {

    /// - Tranfer locals from hook to pages
    return { ...locals, websocketAddress: env.TURBINE_WS_ADDRESS };
};