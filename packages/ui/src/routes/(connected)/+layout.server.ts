import { env } from '$env/dynamic/private';

export const load = async ({ locals }) => {

    /// - Tranfer locals from hook to pages
    return { ...locals, turbineAddress: env.TURBINE_ADDRESS };
};