import type { PageServerLoad } from "../$types";
import type { DocFile } from "@metalizzsas/nuster-turbine/types/docs";
import { env } from "$env/dynamic/private";

export const load = (async ({ fetch }) => {

    const docFiles: DocFile[] = [];

    try
    {
        const nusterDocsFileRequest = await fetch('/docs/files.json');
        if(nusterDocsFileRequest.status === 200 && nusterDocsFileRequest.ok)
        {
            const nusterDocsFiles = await nusterDocsFileRequest.json();
            docFiles.push(...nusterDocsFiles);
        }
    }
    catch(ex)
    {
        console.error("Failed to Load nuster docs from server");
    }

    try
    {
        const machineDocsFileRequest = await fetch(`http://${env.TURBINE_ADDRESS}/static/docs/files.json`);
        if(machineDocsFileRequest.status === 200 && machineDocsFileRequest.ok)
        {
            const machineDocsFiles = await machineDocsFileRequest.json();
            docFiles.push(...machineDocsFiles);
        }
    }
    catch(ex)
    {
        console.error("Failed to load machine docs from turbine server");
    }

    return { docFiles };

}) satisfies PageServerLoad;