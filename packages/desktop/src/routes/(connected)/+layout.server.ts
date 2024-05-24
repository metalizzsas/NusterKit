import { env } from '$env/dynamic/private';

export const load = async ({ locals }) => {

    const settingsRequest = await fetch(`http://${env.TURBINE_ADDRESS}/settings`);

    const { dark, lang } = await settingsRequest.json() as { dark: "1" | "0", lang: string };

    /// - Tranfer locals from hook to pages
    return {

        settings: {
            dark: parseInt(dark),
            lang
        },

        is_machine_screen: locals.is_machine_screen,
        machine_configuration: locals.machine_configuration,
        machine_status: locals.machine_status
    };
    
};