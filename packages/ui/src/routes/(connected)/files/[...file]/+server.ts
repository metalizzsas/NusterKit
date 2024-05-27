import { env } from '$env/dynamic/private';

export const GET = async ({ params, fetch }) => {

    const fileURL = params.file;

    const file = await fetch(`http://${env.TURBINE_ADDRESS}/static/${fileURL}`);

    if(file.status === 200 && file.ok)
        return new Response(file.body, { headers: file.headers });
    else
        return new Response('File not found', { status: 404 });

}