import { env } from '$env/dynamic/private';

export const load = async ({ fetch, params }) => {

    const remoteDocRequest = await fetch(`http://${env.TURBINE_ADDRESS}/static/${params.helpFile}`);
    const localDocRequest = await fetch(`/docs/${params.helpFile}`);

    if(remoteDocRequest.status === 200 && remoteDocRequest.ok)
        return { content: (await remoteDocRequest.text()).replaceAll(/\\(\S*)/g, "") }
    else if(localDocRequest.status === 200 && localDocRequest.ok)
        return { content: (await localDocRequest.text()).replaceAll(/\\(\S*)/g, "") }
    
    return { content: undefined }
}