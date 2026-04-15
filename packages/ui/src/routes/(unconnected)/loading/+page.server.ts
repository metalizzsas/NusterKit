import { redirect } from '@sveltejs/kit';
import { env } from "$env/dynamic/private";

export const load = async () => {

    const result = await fetch(`${env.TURBINE_URL}/machine`).then((res) => {

        return res.ok;
    }).catch(() => {
        return false;
    });

    if(result) {
        redirect(302, "/");
    }

    return {};    
}