import type { LayoutServerLoad } from '../$types';

export const load = (({ locals }) => {

    /// - Tranfer locals from hook to pages
    return {
        is_machine_screen: locals.is_machine_screen
    };
    
}) satisfies LayoutServerLoad;